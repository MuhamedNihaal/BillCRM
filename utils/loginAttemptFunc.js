import moment from "moment";
import getTimeParam from "./getTimeParam.js";
import { accountOrIpBlocking } from "./accountOrIpBlocking.js";
import models from "@/models/index.js";
import { ACTIVITY_ACTIONS, userActivity } from "./userActivity.js";

export const applyBlockStatus = async ({ user, loginAttempt, rule, req, username }) => {
  if (user) {
    user.status = 2;
    await user.save();
  }

  loginAttempt.login_ip = req.ip;
  loginAttempt.username = username;
  loginAttempt.status = 2;
  loginAttempt.time = getTimeParam("timeWithSecond");
  loginAttempt.date = getTimeParam("date");
  const isPermanent = rule.block === "permanent";

  loginAttempt.unblock_at = isPermanent ? null : moment().add(rule.block.value, rule.block.unit).format("YYYY-MM-DD HH:mm:ss");

  await loginAttempt.save();
};

async function loginAttemptFunc({ loginAttempt = null, req = null, username = null, user = null }) {
  if (loginAttempt) {
    loginAttempt.attempts += 1;
    await loginAttempt.save();

    let permanentBlockAttempt = accountOrIpBlocking.find((rule) => rule.block === "permanent");

    if (loginAttempt.attempts >= permanentBlockAttempt.attempts) {
      await applyBlockStatus({ loginAttempt, req, rule: permanentBlockAttempt, username, user });
    }

    for (let rule of accountOrIpBlocking) {
      if (loginAttempt.attempts === rule.attempts) {
        await applyBlockStatus({ loginAttempt, req, rule, username, user });
        break;
      }
    }
  } else {
    await models.LoginAttempt.create({
      login_ip: req.ip ?? null,
      username: username,
      attempts: 1,
    });
  }

  await userActivity({
    action: ACTIVITY_ACTIONS.AUTH.LOGGING_ATTEMPT,
    req,
    description: `Login attempt for username: {userName}`,
    username: username,
  });
}

export default loginAttemptFunc;
