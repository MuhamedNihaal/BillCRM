import { Router } from "express";

const app = Router();

import authRouter from "./webAppRoutes/auth.router.js";
import customer from "./webAppRoutes/customer.route.js";
import options from "./webAppRoutes/options.route.js";

app.get("/", (req, res) => res.send("Web App Running 🚀"));
app.use("/auth", authRouter);
app.use("/customer", customer);
app.use("/options", options);

export default app;
