import { Router } from "express";
const router = Router();
import { multerUpload } from "../helper/functions.js";
import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/modules.controller.js";

const moduleIcon = multerUpload("modules", ["image"]);

router.use(auth({ master: true }));

router.get("/", controller.list);
router.post("/", moduleIcon.single("file"), controller.add);
router.put("/:moduleId", moduleIcon.single("file"), controller.update);
router.delete("/:moduleId", controller.remove);

router.get("/rule", controller.ruleList)
router.post("/rule", controller.rule);
export default router;
