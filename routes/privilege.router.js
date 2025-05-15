import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/privilege.controller.js";

router.use(auth({ master: true }));
router.get("/", controller.list);
router.post("/", controller.add);
router.put("/:privilegeId", controller.update);
router.delete("/:privilegeId", controller.remove);

export default router;
