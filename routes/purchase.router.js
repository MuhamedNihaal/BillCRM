import { Router } from "express";
const router = Router();

import * as controller from "@/controllers/purchase.controller.js";
import { COMMON_ROUTER } from "@/permission.js";

router.get("/render", controller.purchaseRender);

COMMON_ROUTER(router, "/");
// Purchase
router.get("/options/supplier", controller.supplierOptions);
router.get("/options/product", controller.productOptions);

router.post("/", controller.addPurchase);
router.get("/", controller.listPurchases);
router.put("/", controller.updatePurchase);
router.delete("/", controller.deletePurchase);
router.get("/details", controller.getPurchaseDetails);
router.get("/filter/supplier", controller.supplierFilterOptions);

export default router;
