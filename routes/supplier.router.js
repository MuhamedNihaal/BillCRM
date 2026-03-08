import { Router } from "express";
const router = Router();
import auth from "../middleware/crmAuth.js";
import * as controller from "../controllers/supplier.controller.js";

router.use(auth({ master: true }));

router.post("/", controller.createSupplier);
router.put("/", controller.updateSupplier);
router.delete("/", controller.deleteSupplier);
router.get("/", controller.getSuppliers);
router.get("/details", controller.getSupplierDetails);
router.put("/status", controller.statusChange);

export default router;
