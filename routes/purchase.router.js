import { Router } from "express";
const router = Router();
import auth from "../middleware/userAuth.js";
import * as controller from "../controllers/purchase.controller.js";


router.use(auth({ master: true }));

// Purchase
router.get("/options/supplier", controller.supplierOptions)
router.get("/options/product", controller.productOptions)

router.post("/", controller.addPurchase);
router.get("/", controller.listPurchases);
router.put("/", controller.updatePurchase);
router.delete("/", controller.deletePurchase);
router.get("/details", controller.getPurchaseDetails);
router.get("/filter/supplier", controller.supplierFilterOptions)
router.get("/accepted/list", controller.acceptedPurchaseList)

// Accept Purchase
router.get("/accept/options/purchase", controller.purchaseOptionsToAccept)
router.put("/accept/single", controller.acceptSingleItem);

router.get("/payment/list", controller.paymentPurchaseList)
router.put("/payment/status/update", controller.paymentStatus)





export default router;