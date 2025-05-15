import { Router } from "express";
const router = Router();
import auth from "../middleware/userAuth.js";
import * as accountsController from "../controllers/accounts.controller.js";
import * as chartOfAccountController from "../controllers/chartOfAccount.controller.js";

router.use(auth({ master: true }));

router.post("/head", accountsController.addHead);
router.put("/head", accountsController.updateHead);
router.delete("/head", accountsController.deleteHead);
router.get("/head", accountsController.headList);

router.post("/sub-head", accountsController.addSubHead);
router.put("/sub-head", accountsController.updateSubHead);
router.delete("/sub-head", accountsController.deleteSubHead);
router.get("/sub-head", accountsController.subHeadList);

router.post("/chartOfAccount", chartOfAccountController.add);
router.put("/chartOfAccount", chartOfAccountController.update);
router.delete("/chartOfAccount", chartOfAccountController.deleteAccount);
router.get("/chartOfAccount", chartOfAccountController.list);


export default router;