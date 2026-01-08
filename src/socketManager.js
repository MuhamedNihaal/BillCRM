import { io } from "socket.io-client";
import Cookies from "js-cookie";

import { API_URL } from "constants/app.constant";
let socket = null;

/**
 * Initializes the Socket.IO connection and handles authentication.
 * The tokens are sent to the backend where the user ID is extracted
 * and the socket is made to join a user-specific room.
 */

export const initializeSocket = async (onConnect, onDiscount) => {
  try {
    const accessToken = Cookies.get("sToken");

    const tenantId = Cookies.get("tenant-id");

    // Only connect if a connection hasn't been established yet
    if (socket) {
      console.log("Socket already initialized.");
      return;
    }

    socket = io(API_URL, {
      auth: {
        tenantId: tenantId,
        token: accessToken,
      },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🚀 Connected to WebSocket Server");
      if (typeof onConnect === "function") onConnect(socket);
    });

    socket.on("disconnect", (reason) => {
      console.log("💔 Disconnected:", reason);
      if (typeof onDiscount === "function") onDiscount(socket);
    });

    // Optional: Log errors if the backend fails authentication/room-joining
    socket.on("connect_error", (err) => {
      console.error(`Connection Error: ${err.message}`);
    });
  } catch (error) {
    console.error("Error initializing socket", error);
  }
};

/**
 * Function to retrieve the current socket instance.
 */
export const getSocket = () => socket;

/**
 * Disconnects the current socket connection.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket disconnected");
    socket = null;
  }
};

/**
 * Reconnects the socket if it's not currently connected.
 */
export const reConnectSocket = () => {
  if (!socket?.connected) {
    console.log("Attempting to reconnect socket...");
    initializeSocket();
  }
};
