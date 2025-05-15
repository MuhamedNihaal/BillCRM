import { Router } from "express";
import auth from "../middleware/userAuth.js";
import * as controller from "../controllers/incomeExpense.controller.js";
import { newFileName, multerUpload } from "../helper/functions.js";

const router = Router();
const uploadImage = multerUpload("incomeExpense", ["image", "document"]);

router.use(auth({ master: true }));

router.post("/image", uploadImage.single("image"), newFileName);

router.post("/", controller.create);
router.put("/", controller.updatePayments);
router.get(`/`, controller.list);
router.put(`/status`, controller.statusChange);
router.get("/edit", controller.getEditPaymentDetails);

router.get("/details", controller.details);
router.post(`/credit`, controller.addCreditPayment);

// Credits - main menu
router.get("/credit", controller.listCreditPayments);

router.get("/options/sub-head", controller.subHeadOptions);
router.get("/options/fund-source", controller.fundSourceOptions);

router.get(`/filter/options/sub-head`, controller.filterSubHeadOptions);

export default router;
