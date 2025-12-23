import { privilege } from "@/config/security.js";
import models from "../models/index.js";
const staffAppNotifier = async () => {
  let notAcceptedCollectionRequest = await models.CollectionRequest.find({ collectionStatus: 1 }).distinct("_id");

  let staff_app_users = await models.User.find(
    { privilege: privilege.STAFF_APP },
    { name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] }, email: 1, mobile: 1 }
  )
    .lean()
    .exec();

  const tasks = notAcceptedCollectionRequest.flatMap((requestId) => staff_app_users.map((u) => ({ requestId, staffId: u._id, staffName: u.name })));

  for (const t of tasks) {
    console.log(t.requestId, t.staffName, t.staffId);
  }
};

export default staffAppNotifier;
