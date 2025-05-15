import { Router } from "express";
import auth from "../middleware/userAuth.js";
import * as controller from "../controllers/fundTransfer.controller.js";

const router = Router();

router.use(auth({ sub_menu: "/fund-transfer" }));

router.get(`/`, controller.list);
router.post(`/`, controller.create);
router.put(`/status`, controller.statusChange);

export default router;
