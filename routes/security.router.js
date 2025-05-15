import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/security.controller.js";

router
  .route("/activity-log")
  .all(auth({ master: true }))
  .get(controller.listUserActivityLog);

router
  .route("/blocked")
  .all(auth({ master: true }))
  .get(controller.listBlockedIp)
  .put(controller.removeBlock);

export default router;
