import { Router } from "express"
const router = Router();
import * as controller from "../controllers/collectionCenter.controller.js"
import auth from "../middleware/userAuth.js"

router.use(auth({ master: true }))


router.post("/", controller.createCollectionCenter);
router.put("/", controller.updateCollectionCenter);
router.delete("/", controller.deleteCollectionCenter);
router.get("/", controller.listCollectionCenters);
router.get("/details", controller.listDetails);
router.put("/status", controller.statusChange);
router.get("/:id", controller.listForUpdate)


export default router;