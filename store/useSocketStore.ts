import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    // Disconnect existing socket if any
    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("add_user", user._id);
    });

    socket.on("get_online_users", (users: string[]) => {
      set({ onlineUsers: users });
    });

    socket.on("receive_message", (message) => {
      useChatStore.getState().addMessage(message);
    });

    socket.on("message_updated", (message) => {
      useChatStore.getState().updateMessage(message);
    });

    socket.on("incoming_call", ({ signal, from, name }) => {
      // Dynamic import to avoid circular dependency if any, but regular import is fine too
      import("./useCallStore").then((module) => {
        module.useCallStore.getState().setReceivingCall(true, from, name, signal);
      });
    });

    socket.on("user_typing", (userId) => {
      useChatStore.getState().addTypingUser(userId);
    });

    socket.on("user_stopped_typing", (userId) => {
      useChatStore.getState().removeTypingUser(userId);
    });

    set({ socket });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
