import { Router } from "express";
const router = Router();

import crmAuth from "./middleware/crmAuth.js";

//! Core Routers
import authRouter from "@/routes/auth.router.js";
import securityRouters from "@/routes/security.router.js";
import privilegeRoute from "@/routes/privilege.router.js";
import moduleRoute from "@/routes/module.router.js";
import searchRouter from "@/routes/search.router.js";

//!Purchase Routes
import productRoute from "./routes/product.router.js";
import supplierRoute from "./routes/supplier.router.js";
import purchaseRouter from "./routes/purchase.router.js";

//!Common Routes
import userRouter from "@/routes/user.router.js";
import optionsRouter from "@/routes/options.router.js";

//? purchase routers
router.use("/supplier", supplierRoute);
router.use("/product", productRoute);
router.use("/purchase", purchaseRouter);

//? common routes
router.use("/options", crmAuth({ common: true }), optionsRouter);

//? core routers
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/privilege", privilegeRoute);
router.use("/module", moduleRoute);
router.use("/search", searchRouter);
router.use(securityRouters);

export default router;
