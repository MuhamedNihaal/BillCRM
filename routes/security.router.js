import { Router } from "express";
const router = Router();
import auth from "@/middleware/crmAuth.js";

import * as controller from "../controllers/security.controller.js";

router
  .route("/activity-log")
  .all(auth({ common: true }))
  .get(controller.listUserActivityLog);

router.get("/activity-actions", auth({ common: true }), controller.userActivityActions);

router
  .route("/blocked")
  .all(auth({ common: true }))
  .get(controller.listBlockedIp)
  .put(controller.removeBlock);

export default router;
