import { getIO } from "./socket.js";
export const emitToSpecificUser = (accountId, event, data) => {
  let io = getIO();
  io.to(accountId?.toString()).emit(event, data);
};

export const emitToAllUser = (event, data) => {
  const io = getIO();
  io.emit(event, data);
};
