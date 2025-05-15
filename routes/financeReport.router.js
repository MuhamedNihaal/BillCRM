import { Router } from "express";

import auth from "../middleware/userAuth.js";
import * as controller from "../controllers/financeReport.controller.js";

const router = Router();

router.use(auth({ sub_menu: "/income-expense-report" }));

// Income / Expense report
router.get(`/income-expense`, controller.incomeExpenseReport);

router.get("/profit-loss", controller.profitAndLoss);
router.get("/profit-loss/options/head", controller.subHeadOptions);


export default router;