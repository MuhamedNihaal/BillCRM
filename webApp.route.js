import { Router } from "express";

const app = Router();

app.get("/", (req, res) => res.send("Web App Running 🚀"));

export default app;
