import { Router } from "express";
const router = Router();
import rateLimiter from "express-rate-limit";
import auth from "@/middleware/crmAuth.js";
import * as controller from "@/controllers/auth.controller.js";

const loginLimiter = rateLimiter({
  windowMs: 10 * 1000, // 10 seconds
  max: 30,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(loginLimiter);
router.post("/login", controller.login);
router.post("/mfa/verify", controller.verifyTwoFactor);

router.post("/refresh-token", controller.renewAccessToken);

router.get("/check-allowed", auth({ common: true }), controller.allowed);
router.post("/logout", auth({ common: true }), controller.logout);
router.get("/session", auth({ common: true }), controller.listSessions);
router.put("/change-password", auth({ common: true }), controller.changePassword);

export default router;
