import jwt from "jsonwebtoken";
import models from "../models/index.js";
import getPublicUser from "../utils/getPublicUser.js";
import { verifyToken } from "@/utils/tokenHandler.js";

const auth = async (socket, next) => {
  const handshake = socket.handshake.auth;

  const platform = handshake?.platform ?? "crm";

  if (["crm" | "app" | "website"].includes(platform)) {
    return next(new Error("Invalid platform"));
  }

  if (!handshake.token) {
    return next(new Error("Invalid authentication token"));
  }

  try {
    let isTokenValid = verifyToken({ token: handshake.token, type: "socket", platform: platform });
    const user = await models.User.findById(isTokenValid.id).lean();
    socket.user = getPublicUser(user);

    return next();
  } catch (error) {
    return next(new Error("Invalid authentication token"));
  }
};

export default auth;
