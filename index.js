import "dotenv/config";

import express from "express";
import path, { dirname } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import chalk from "chalk";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import nocache from "nocache";
import session from "express-session";
import { fileURLToPath } from "url";
import { error } from "express-error-catcher";

//! config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set("trust proxy", 1);

import http from "http";
const server = http.createServer(app);

//! Internal file import
import * as config from "./config/index.js";
import "./helper/global.js";
import notFound from "./middleware/notFound.js";
import connectDB from "./database/index.js";
import "./cron/index.js";
import { startSocket } from "./socket/socket.js";

import crmRouter from "./crm.route.js";
import webAppRouter from "./webApp.route.js";
import tokenSetter from "./middleware/tokenSetter.js";
import deviceIdSetter from "./middleware/deviceIdSetter.js";

//! =============> start middleware
app.use(cookieParser());
app.use(hpp()); // Prevent HTTP parameter pollution
app.use(nocache());
app.use(
  helmet({
    // crossOriginEmbedderPolicy: false,
    // crossOriginOpenerPolicy: { policy: "same-origin" },
    // crossOriginResourcePolicy: { policy: "same-origin" },
    // referrerPolicy: { policy: "no-referrer" },
    // frameguard: { action: "deny" },

    contentSecurityPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    xssFilter: true,
    dnsPrefetchControl: { allow: false },
    hidePoweredBy: true,
  })
);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));
app.use(express.json({ limit: config.BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: config.BODY_SIZE_LIMIT }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(
  session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.production,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: config.production ? "none" : "lax",
    },
  })
);
app.use(cors(config.cors()));

app.use(tokenSetter)

app.use(deviceIdSetter)

startSocket(server);

app.use("/webApp", webAppRouter);
app.use("/", crmRouter);
app.get("/", (req, res) => res.status(200).json({ message: "Crm Running 🚀", status: 200, method: req.method }));

app.use(error({ log: "dev" }));

app.use(notFound);

connectDB()
  .then(() => {
    server.listen(config.PORT, () => {
      console.log(chalk.blueBright(`server listening on port ${config.PORT}`));
    });
  })
  .catch((error) => {
    console.log(chalk.red(`server not started`), error);
  });

export default app;
