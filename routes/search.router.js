import { Router } from "express";
const router = Router();

import * as controller from "@/controllers/search.controller.js";

router.get("/", controller.search);
export default router;
