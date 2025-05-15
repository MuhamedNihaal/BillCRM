import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config.js";
import models from "../models/index.js";

const auth = async (socket, next) => {
  let assessToken = socket.handshake.auth?.token;
  let refreshToken = socket.handshake.auth?.refreshToken;
  if (!assessToken || !refreshToken) return next(new Error("Invalid authentication token"));

  try {
    const tokenDetails = jwt.verify(assessToken, ACCESS_TOKEN_SECRET);
    const user = await models.User.findById(tokenDetails._id).select("-password");
    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Invalid authentication token"));
  }
};

export default auth;
