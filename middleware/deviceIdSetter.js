import { v4 as uuidv4 } from "uuid";
import { asyncErrorHandler } from "express-error-catcher";
import jwt from "jsonwebtoken";

export const deviceIdSetter = asyncErrorHandler(async (req, res, next) => {
  let requestId = uuidv4();

  const token = req.cookies?.token || req.headers["x-access-token"];
  const refreshToken = req?.cookies?.["refresh-token"] || req.headers["x-refresh-token"];

  if (token || refreshToken) {
    try {
      if (token) {
        const decoded = jwt.decode(token, { complete: true });
        const deviceId = decoded?.header?.kid;

        if (deviceId) {
          requestId = deviceId;
        }
      }

      if (refreshToken) {
        const decoded = jwt.decode(refreshToken, { complete: true });
        const deviceId = decoded?.header?.kid;

        if (deviceId) {
          requestId = deviceId;
        }
      }
    } catch (error) {
      console.error("Failed to decode device ID from JWT:", error.message);
    }
  }

  if (!req.session?.requestId) {
    req.session.requestId = requestId;
  } else {
    requestId = req.session.requestId;
  }

  res.setHeader("X-Request-ID", requestId);
  req.deviceId = requestId;

  req.session.save(() => next());
});

export default deviceIdSetter;
