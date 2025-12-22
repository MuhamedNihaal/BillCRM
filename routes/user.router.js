import { Router } from "express";
const router = Router();

//! Local Imports
import auth from "@/middleware/crmAuth.js";
import * as controller from "../controllers/user.controller.js";
import { fileFilter, multerUpload } from "@/helper/index.js";

const profileImageUpload = multerUpload({
  folder: "profile",
  filter: fileFilter([".png", ".jpg", ".jpeg"]),
  required: true,
  requiredMsg: "Profile image is required",
  limits: { fileSize: 2 * 1024 * 1024 },
});

//? User Routes
router.get("/activity", auth({ common: true }), controller.listUserActivityLog);
router.post("/image", auth({ common: true }), profileImageUpload.single("file"), controller.uploadProfileImage);
router.put("/basic", auth({ common: true }), controller.basicData);

router.get("/", auth({ common: true }), controller.getUserInfo);
router.put("/", auth({ common: true }), controller.updateUser);
router.delete("/", auth({ common: true }), controller.deleteUser);

router.post("/browser/token", auth({ common: true }), controller.userBrowserToken);
router.get("/browser/token", auth({ common: true }), controller.getUserBrowserToken);

router.get("/details/:id", auth({ common: true }), controller.userDetails);
router.put("/mfa/setup", auth({ common: true }), controller.setupMFA);

//? Master Routes
router.post("/", auth({ master: true }), controller.addUser);
router.get("/list", auth({ master: true }), controller.listUser);
router.put("/status", auth({ master: true }), controller.userActiveInactive);
router.put("/password", auth({ master: true }), controller.changePassword);
router.put("/privilege", auth({ master: true }), controller.updatePrivilege);
export default router;
