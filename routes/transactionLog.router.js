import { Router } from "express";

import * as controller from "../controllers/transactionLog.controller.js";
import auth from "../middleware/userAuth.js";

const router = Router();

router.use(auth({sub_menu: "/transaction-log"}));

router.get("/", controller.list);
router.get("/options/user", controller.userOptions);
router.get("/options/chart-of-account", controller.chartOfAccountOptions);
router.get("/options/account-head", controller.accountHeadOptions);
router.get("/options/account-sub-head", controller.accountSubHeadOptions);

export default router;
