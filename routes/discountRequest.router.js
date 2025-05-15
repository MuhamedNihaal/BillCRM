import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/discountRequest.controller.js";

// discount request
router.use("/request", auth({ sub_menu: "/billing" }));
router.route("/request").post(controller.addRequest);
router.route("/request/:id").delete(controller.cancelRequest);

// discount approval
router.use("/approval", auth({ sub_menu: "/discount-approval" }));
router
  .route("/approval")
  .get(controller.discountList)
  .post(controller.acceptDiscount);
export default router;
