import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
import cors from "cors";
import "dotenv/config";
import { BODY_SIZE_LIMIT, PORT } from "./config.js";
import "./helper/passportTokenStrategy.js";

import helmet from "helmet";
import hpp from "hpp";
import nocache from "nocache";

// import rateLimiter from "express-rate-limit";
// const limiter = rateLimiter({
//   windowMs: 3 * 60 * 1000,
//   max: 100, // Limit each IP to 100 requests per window
//   message: "Too many requests, please try again later.",
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// import { startSocket } from "./socket/socket.js";

import connectDB from "./database/index.js";

import crmRouter from "./crm.route.js";
import webAppRouter from "./webApp.route.js";
const app = express();

import http from "http";
const server = http.createServer(app);

import "./helper/global.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import notFound from "./middleware/notFound.js";
import { error } from "express-error-catcher";

// =============> security configuration
app.use(helmet.hsts()); // communication only on HTTPS
app.disable("x-powered-by");
app.use(helmet.frameguard());
app.use(helmet.xXssProtection());
app.use(nocache());
app.use(hpp());
// app.use(limiter);

app.use(logger("dev"));
app.use(express.json({ limit: BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// startSocket(server);

app.use("/webApp", webAppRouter);
app.use("/", crmRouter);

app.use(error({ log: "dev" }));

app.use(notFound);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(chalk.blueBright(`server listening on port ${PORT}`));
    });
  })
  .catch((error) => {
    console.log(chalk.red(`server not started`), error);
  });

export default app;
