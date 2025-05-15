import { Router } from "express";
const router = Router();

import auth from "../middleware/userAuth.js";

import * as controller from "../controllers/manage.controller.js";

// units route
router.use("/units", auth({ sub_menu: "/units" }));
router.route("/units").get(controller.listUnit).post(controller.addUnits);
router.route("/units/:id").put(controller.updateUnits).delete(controller.removeUnits);

// methods route
router.use("/methods", auth({ sub_menu: "/methods" }));
router.route("/methods").get(controller.listMethods).post(controller.addMethods);
router.route("/methods/:id").put(controller.updateMethods).delete(controller.removeMethods);

// doctors route
router.use("/doctors", auth({ sub_menu: "/doctors" }));
router.route("/doctors").get(controller.listDoctors).post(controller.addDoctors);
router.route("/doctors/:id").put(controller.updateDoctors).delete(controller.removeDoctors);

// hospital route
router.use("/hospitals", auth({ sub_menu: "/hospitals" }));
router.route("/hospitals").get(controller.listHospital).post(controller.addHospital);
router.route("/hospitals/:id").put(controller.updateHospital).delete(controller.removeHospital);

// hospital route
router.use("/labs", auth({ sub_menu: "/labs" }));
router.route("/labs").get(controller.listLab).post(controller.addLab);
router.route("/labs/:id").put(controller.updateLab).delete(controller.removeLab);

// antibiotics route
router.use("/antibiotics", auth({ sub_menu: "/antibiotics" }));
router.route("/antibiotics").get(controller.listAntibiotics).post(controller.addAntibiotics);
router.route("/antibiotics/:id").put(controller.updateAntibiotics).delete(controller.removeAntibiotics);

// analysis type route
router.use("/analysis-type", auth({ sub_menu: "/analysis-type" }));
router.route("/analysis-type").get(controller.listAnalysisType).post(controller.addAnalysisType);
router.route("/analysis-type/:id").put(controller.updateAnalysisType).delete(controller.removeAnalysisType);

// consumable category route
router.use("/consumable-category", auth({ sub_menu: "/consumable-category" }));
router.route("/consumable-category").get(controller.listConsumableCategory).post(controller.addConsumableCategory);
router.route("/consumable-category/:id").put(controller.updateConsumableCategory).delete(controller.removeConsumableCategory);

// consumable route
router.use("/consumable", auth({ sub_menu: "/consumable" }));
router.route("/consumable").get(controller.listConsumable).post(controller.addConsumable);
router.route("/consumable/:id").put(controller.updateConsumable).delete(controller.removeConsumable);

// range type route
router.use("/range-type", auth({ sub_menu: "/range-type" }));
router.route("/range-type").get(controller.listRangeType).post(controller.addRangeType);
router.route("/range-type/:id").put(controller.updateRangeType).delete(controller.removeRangeType);

router.use("/sample", auth({ sub_menu: "/samples" }));
router.route("/sample").get(controller.listSample).post(controller.addSample);
router.route("/sample/:id").put(controller.updateSample).delete(controller.removeSample);

router.use("/department", auth({ sub_menu: "/departments" }));
router.route("/department").get(controller.listDepartments).post(controller.addDepartment);
router.route("/department/:id").put(controller.updateDepartment).delete(controller.removeDepartment);

router.use("/sample-data", auth({ sub_menu: "/sample-data" }));
router.route("/sample-data").get(controller.listSampleData).post(controller.addSampleData);
router.route("/sample-data/:id").put(controller.updateSampleData).delete(controller.removeSampleData);

router.use("/remarks", auth({ sub_menu: "/remarks" }));
router.route("/remarks").get(controller.listRemarks).post(controller.addRemarks);
router.route("/remarks/:id").put(controller.updateRemarks).delete(controller.removeRemarks);

export default router;
