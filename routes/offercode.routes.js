import express from "express";
import * as controllers from "../controllers/offercode.controller.js";
import auth from "../middleware/userAuth.js";
const router = express.Router();

router.use("/verify", auth({ sub_menu: "/billing" }));
router.get("/verify", controllers.verifyOfferCode);

router.use(auth({ master: true }));
router.post("/", controllers.addOfferCode);
router.put("/", controllers.updateOfferCode);
router.get("/", controllers.listOfferCode);
router.delete("/", controllers.deleteOfferCode);
router.get("/details", controllers.details);
router.put("/status", controllers.statusChange);

router.get("/log", controllers.logList);
router.get("/log/options", controllers.offerCodeOptions);

export default router;
