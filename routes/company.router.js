import { Router } from "express";
const router = Router();
import * as controller from "../controllers/company.controller.js"
import auth from "../middleware/userAuth.js"
import { multerUpload, newFileName } from "../helper/functions.js";

const companyLogo = multerUpload("company", ["image"]);

router.use(auth({ master: true }))


router.post("/logo", companyLogo.single("logo"), newFileName)
router.post("/", controller.createCompany);
router.put("/", controller.updateCompany);
router.get("/", controller.listCompanies);
router.get("/details", controller.listDetails);
router.get("/:id", controller.listForUpdate);
router.delete("/", controller.deleteCompany);

router.put("/status", controller.changeStatus);






export default router;