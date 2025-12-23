import { Router } from "express";
const router = Router();
import { asyncErrorHandler } from "express-error-catcher";

import * as security from "@/config/security.js";
import * as finance from "@/config/finance.js";
import auth from "@/middleware/crmAuth.js";

import * as controller from "@/controllers/privilege.controller.js";
import { isSame } from "@/helper/other.js";

let checkPresetIds = asyncErrorHandler((req, _res, next) => {
  let privilegeId = req.params.privilegeId;

  let errorFlag = false;

  let imported_ids = { ...security.privilege, ...finance.DISCOUNT_APPROVER };

  Object.keys(imported_ids).forEach((key) => {
    if (isSame(imported_ids[key], privilegeId)) {
      errorFlag = true;
    }
  });

  if (errorFlag) {
    throw new Error("this privilege cannot be edited or delete", 403);
  }

  next();
});

router.use(auth({ master: true }));
router.get("/", controller.list);
router.post("/", controller.add);
router.put("/:privilegeId", checkPresetIds, controller.update);
router.delete("/:privilegeId", checkPresetIds, controller.remove);
router.get("/:privilegeId", controller.moduleList);

export default router;
