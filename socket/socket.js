import { Server } from "socket.io";
import socketAuth from "./socketAuth.js";

let io = null;
let socket = null;

const startSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`New socket client: ${socket.id} connected`);
    // Store user's accountId in socket
    const user = socket.user;
    if (user && user?._id) {
      const roomId = user?._id?.toString();
      socket.accountId = roomId;

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    }

    socket = socket;
    socket.on("disconnect", (reason) => {
      console.log(`Socket client ${socket.id} disconnected, Reason: ${reason}`);
    });
  });
};

const getIO = () => io;
const getSocket = () => socket;

export { startSocket, getIO, getSocket };
