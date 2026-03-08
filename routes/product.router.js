import { Router } from "express";
const router = Router();
import auth from "../middleware/crmAuth.js";
import * as controller from "../controllers/product.controller.js";

router.use(auth({ master: true }));

router.post("/", controller.createProduct);
router.put("/", controller.updateProduct);
router.delete("/", controller.deleteProduct);
router.get("/", controller.getProduct);
router.get("/details", controller.getProductDetails);
router.put("/status", controller.statusChange);

export default router;
