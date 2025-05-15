import { Router } from "express";
const app = Router();

import auth from "./middleware/userAuth.js";

import authRouter from "./routes/auth.router.js";
import privilegeRoute from "./routes/privilege.router.js";
import moduleRoute from "./routes/modules.router.js";
import menuRoute from "./routes/menu.router.js";
import userRoute from "./routes/user.router.js";
import securityRoute from "./routes/security.router.js";
import optionsRoute from "./routes/options.router.js";
import companyRoute from "./routes/company.router.js";
import branchRoute from "./routes/branch.router.js";
import collectionCenterRoute from "./routes/collectionCenter.router.js";

app.get("/", (req, res) => res.send("Crm Running 🚀"));
app.use("/auth", authRouter);

app.use("/options", optionsRoute);

app.use("/privilege", privilegeRoute);
app.use("/module", moduleRoute);
app.use("/menu", menuRoute);
app.use("/user", userRoute);
app.use("/companies", companyRoute);
app.use("/branches", branchRoute);
app.use("/collection-center", collectionCenterRoute);

app.use(securityRoute);

export default app;
