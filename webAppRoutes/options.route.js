import express from "express";
const router = express.Router();
import * as controller from "../webAppController/options.controller.js";
import auth from "../middleware/customerAuth.js";


router.post("/relation",auth, controller.relationships);

export default router;
