import { Server } from "socket.io";
import authSocket from "./authSocket.js";
import { allowedOrigins } from "@/config/index.js";

let io = null;

const startSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.use(authSocket);

  io.on("connection", (socket) => {
    console.log(`New socket client: ${socket.id} connected`);

    const user = socket.user;
    if (user && user?._id) {
      const roomId = user._id.toString();
      socket.userId = roomId;

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    }

    socket.on("disconnect", (reason) => {
      console.log(`Socket client ${socket.id} disconnected, Reason: ${reason}`);
    });
  });
};

const getIO = () => io;
export { startSocket, getIO };
