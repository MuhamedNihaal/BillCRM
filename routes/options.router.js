import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/options.controller.js";

router
  .use(auth({ common: true }))
  .get("/states", controller.states)
  .get("/branch/all", controller.allBranches)
  .get("/branches/listing-options", controller.branchesListingOptions)
  .get("/districts", controller.districts)
  .get("/countries", controller.countries)
  .get("/company", controller.company)
  .get("/branch", controller.branch)
  .get("/account-head", controller.accountHead)
  .get("/account-sub-head", controller.accountSubHead)
  .get("/chart-of-account", controller.chartOfAccount)
  .get("/fund-source", controller.fundSource)
  .get("/main-branch", controller.mainBranch)
  .get("/sub-branch", controller.subBranch)
  .get("/franchise", controller.franchise)
  .get("/collection-center", controller.collectionCenter);

router
  .use(auth({ master: true }))
  .get("/module", controller.module)
  .get("/menu", controller.menu)
  .get("/sub-menu", controller.subMenu)
  .get("/privilege", controller.privilege)
  .get("/user", controller.user);

export default router;
