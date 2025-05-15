import { Router } from "express";
const router = Router();
import { multerUpload } from "../helper/functions.js";
import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/user.controller.js";

const profileImage = multerUpload("profile", ["image"]);

router.use(auth({ common: true }));
router.get("/activity", controller.listUserActivityLog);
router.post("/image", profileImage.single("file"), controller.uploadImage);
router.put("/", controller.updateUser);
router.get("/", controller.getUserInfo);

router.use(auth({ master: true }));
router.post("/", controller.addUser);
router.get("/list", controller.listUser)
export default router;
