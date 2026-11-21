import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";
import { SocketContext } from "./SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getDataByLanguage } from "../utils/functions";
import { useNavigate } from "react-router";

export default function SocketProvider({ children }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const userId = user?.data?.id;

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

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setSocket(newSocket);
      setConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setConnected(false);
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

    newSocket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== String(userId)));
    });

    newSocket.on("logout", () => {
      queryClient.invalidateQueries(["current-user"]);
      setUser(null);
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

    newSocket.on("judge:update", (data) => {
      // console.log(data);
      // queryClient.invalidateQueries(["contest", contestId]);
      // queryClient.invalidateQueries(["contests"]);
    });

    newSocket.on("notification", (data) => {
      console.log(data);
      toast.success(getDataByLanguage(data, "message", i18n.language));
      // queryClient.invalidateQueries(["contest", contestId]);
      // queryClient.invalidateQueries(["contests"]);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);

      setConnected(false);
      setSocket(null);
      setOnlineUsers([]);
    });

    return () => {
      console.log("🧹 Closing socket:", newSocket.id);

      newSocket.removeAllListeners();
      newSocket.disconnect();

      socketRef.current = null;
      setSocket(null);
      setOnlineUsers([]);
      setConnected(false);
    };
  }, [user?.data?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
