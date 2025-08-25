import models from "../models/index.js";
/**
 *
 * @param {object} params
 * @param {object} params.req - Express request object containing user and IP info.
 * @param {string} params.action - The action performed by the user.
 * @param {string} params.description - A description of the activity.
 * @returns {Promise<object>} Saved user activity document.
 *
 * @typedef {object} UserActivity
 * @property {string} action - The action performed.
 * @property {string} ip - IP address of the user.
 * @property {string} userId - ID of the user performing the action.
 * @property {string} user - Name of the user.
 */
export const userActivity = async ({ req, action, description }) => {
  try {
    let userName = !req?.user?.firstName && !req?.user?.lastName ? req.user.username : `${req.user.firstName || ""} ${req.user.lastName || ""}`;

    const finalDescription = description.replace("{userName}", userName);
    const data = await models
      .UserActivity({
        action,
        description: finalDescription,
        ip: req.ip,
        userId: req.user._id,
        user: userName.trim(),
      })
      .save();

    return data;
  } catch (error) {
    console.log("Failed to log user activity");
  }
};
