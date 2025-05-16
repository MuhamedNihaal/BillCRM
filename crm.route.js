import { Router } from "express";
const app = Router();

import authRouter from "./routes/auth.router.js";

import userRoute from "./routes/user.router.js";
import privilegeRoute from "./routes/privilege.router.js";

app.get("/", (req, res) => res.send("Crm Running 🚀"));
app.use("/auth", authRouter);

app.use("/user", userRoute);
app.use("/privilege", privilegeRoute);

export default app;
