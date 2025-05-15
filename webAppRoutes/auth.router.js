import express from "express";
const router = express.Router();

import * as controller from "../webAppController/auth.controller.js";

router.post("/login", controller.customerLoginMobile);

router.post("/resend", controller.resendOtp);
router.post("/verify/app", controller.verifyOtp(false));
router.post("/verify/web", controller.verifyOtp(true));
router.post("/refresh-token/app", controller.getAccessToken(false));
router.post("/refresh-token/web", controller.getAccessToken(true));

export default router;
