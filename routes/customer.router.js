import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/customer.controller.js";

router.use(auth({ menu: "customers" }));

router
  .route("/category")
  .get(controller.listCustomerCategory)
  .post(controller.addCustomerCategory);
router
  .route("/category/:id")
  .put(controller.updateCustomerCategory)
  .delete(controller.removeCustomerCategory);

router
  .route("/")
  .get(controller.listCustomer)
  .post(controller.addCustomer)
  .delete(controller.removeCustomer);
router
  .route("/:id")
  .put(controller.updateCustomer)
  .delete(controller.removeCustomer);
export default router;
