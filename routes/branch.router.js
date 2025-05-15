import { Router } from "express";
const router = Router();
import * as controller from "../controllers/branch.controller.js";
import auth from "../middleware/userAuth.js"
import { multerUpload, newFileName } from "../helper/functions.js";

const branchLogo = multerUpload("branch", ["image"]);

router.use(auth({ master: true }))

router.post("/logo", branchLogo.single("logo"), newFileName)

router.post("/", controller.createBranch);
router.put("/", controller.updateBranch);
router.delete("/", controller.deleteBranch);
router.get("/", controller.listBranches);
router.get("/details", controller.listDetails);
router.put("/status", controller.statusChange);
router.get("/:id", controller.listForUpdate);






export default router;