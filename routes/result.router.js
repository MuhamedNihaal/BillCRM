import { Router } from "express";
const router = Router();
import * as controller from "../controllers/result.controller.js";

router.route("/").get(controller.resultList);

router.route("/:id").get(controller.resultTest);

export default router;
