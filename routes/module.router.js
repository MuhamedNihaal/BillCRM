import { Router } from "express";
const router = Router();

import auth from "@/middleware/crmAuth.js";

import * as controller from "@/controllers/modules.controller.js";
import { MASTER_SETTING } from "@/permission.js";

MASTER_SETTING.rules(router, "/rules");
router.get("/rules", controller.rulesList);
router.post("/rules", controller.rules);

MASTER_SETTING.module(router, "/");
router.get("/", controller.list);
router.put("/:moduleId", controller.update);

export default router;
