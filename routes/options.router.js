import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/options.controller.js";

router
  .use(auth({ common: true }))
  .get("/states", controller.states)
  .get("/districts", controller.districts)
  .get("/countries", controller.countries)
  .get("/company", controller.company)
  .get("/branch", controller.branch);

router
  .use(auth({ master: true }))
  .get("/module", controller.module)
  .get("/menu", controller.menu)
  .get("/sub-menu", controller.subMenu)
  .get("/privilege", controller.privilege)
  .get("/user", controller.user);

export default router;
