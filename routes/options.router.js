import { Router } from "express";
const router = Router();

import * as controller from "@/controllers/options.controller.js";

//! Common Options
router.get("/countries", controller.countries).get("/states", controller.states).get("/districts", controller.districts);


//! Core Options
router.get("/privilege", controller.privilege).get("/module", controller.module).get("/user", controller.user);

export default router;
