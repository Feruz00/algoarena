import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";
import { SocketContext } from "./SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export default function SocketProvider({ children }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = user?.data?.id;
    setIsConnected(false);
    // User is not authenticated
    if (!userId) {
      setSocket(null);
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    console.log("Connecting socket...");
    console.log("Socket URL:", socketUrl);
    console.log("User ID:", userId);

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"],
      query: {
        id: String(userId),
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      setIsConnected(false);
      console.error("❌ Socket connection error:", error.message);
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });
    newSocket.on("userOnline", (userId) => {
      setOnlineUsers((prev) => {
        if (prev.includes(String(userId))) {
          return prev;
        }

        return [...prev, String(userId)];
      });
    });

    newSocket.on("logout", () => {
      queryClient.invalidateQueries(["current-user"]);
      setUser(null);
      setIsConnected(false);
      navigate("/login");
    });
    newSocket.on("contest:started", ({ contestId }) => {
      queryClient.invalidateQueries(["contest", contestId]);
      queryClient.invalidateQueries(["contests"]);
    });
    newSocket.on("contest:finished", ({ contestId }) => {
      // console.log("finished", contestId);
      queryClient.invalidateQueries(["contest", contestId]);
      queryClient.invalidateQueries(["contests"]);
    });

    newSocket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== String(userId)));
    });
    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("🔌 Socket disconnected:", reason);

      setSocket(null);
      setOnlineUsers([]);
    });

    return () => {
      setIsConnected(false);
      console.log("🧹 Closing socket:", newSocket.id);

      newSocket.removeAllListeners();
      newSocket.disconnect();

      socketRef.current = null;
      setSocket(null);
      setOnlineUsers([]);
    };
  }, [user?.data?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
