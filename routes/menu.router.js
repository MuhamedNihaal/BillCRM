import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/menu.controller.js";

router.use(auth({ master: true }));

router.get("/", controller.list);
router.post("/", controller.add);
router.put("/:id", controller.update);
router.delete("/:id", controller.deleteMenu);

router.get("/sub-menu", controller.listSubMenu);
router.post("/sub-menu", controller.addSubMenu);
router.put("/sub-menu/:id", controller.updateSubMenu);
router.delete("/sub-menu/:id", controller.deleteSubMenu);

export default router;
