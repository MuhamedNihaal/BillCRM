import express from "express";
const router = express.Router();
import * as controller from "../webAppController/customer.controller.js";
import CustAuth from "../middleware/customerAuth.js";


router.post("/register",CustAuth, controller.registration);
router.get("/profile",CustAuth, controller.profile);

export default router;
