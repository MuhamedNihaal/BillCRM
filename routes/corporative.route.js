import { Router } from "express";
const router = Router();
import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/corporative.controller.js";

// router.use(auth({ master: true }));
router.route("/").get(controller.listCorporative).post(controller.addCorporative)

router.route("/:id").put(controller.updateCorporative).delete(controller.removeCorporative)

export default router;
