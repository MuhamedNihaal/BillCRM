import { Router } from "express";
import * as controller from "../controllers/creditDebit.controller.js";
import auth from "../middleware/userAuth.js";

const router = Router();
router.use(auth({ master: true }));

router.get("/", controller.list);
router.post("/", controller.create);
router.put("/status", controller.updateStatus);

export default router;
