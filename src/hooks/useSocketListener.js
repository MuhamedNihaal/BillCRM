import { useEffect, useCallback } from "react";
import { getSocket } from "../socketManager";

/**
 * * @param {string} eventName - The name of the event to listen for (e.g., 'new_chat_assigned').
 * @param {function} handler - The callback function to execute when the event fires.
 */
const useSocketListener = (eventName, handler) => {
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !eventName || typeof memoizedHandler !== "function") {
      return;
    }

    socket.on(eventName, memoizedHandler);

    return () => {
      socket.off(eventName, memoizedHandler);
    };
  }, [eventName, memoizedHandler]);
};

export default useSocketListener;
