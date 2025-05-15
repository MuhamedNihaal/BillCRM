import { Router } from "express";
const router = Router();
import auth from "../middleware/userAuth.js";
import rateLimiter from "express-rate-limit";
const loginLimiter = rateLimiter({
  windowMs: 10 * 1000, // 10 seconds
  max: 20,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

import * as controller from "../controllers/auth.controller.js";
router.use(loginLimiter);
router.post("/login", controller.login("web"));

router.use(auth({ common: true }));
router.post("/check-allowed", controller.allowed);
router.post("/logout", controller.logout);

export default router;
