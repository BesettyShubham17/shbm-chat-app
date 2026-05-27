import { useEffect, useState } from "react";
import AddStoryModal from "./AddStoryModal";
import { Search, LogOut, MessageSquare, Plus } from "lucide-react";

import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore, ChatUser } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import AnimatedLogo from "./AnimatedLogo";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { activeChat, setActiveChat } = useChatStore();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const { onlineUsers, disconnectSocket } = useSocketStore();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com"}/api/users?search=${search}`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com"}/api/auth/logout`, {}, { withCredentials: true });
      logout();
      disconnectSocket();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <div className="w-80 border-r border-white/5 flex flex-col h-full bg-surface/30 backdrop-blur-md">
        {/* Branding */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
          <AnimatedLogo width={36} height={36} />
          <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-primary tracking-wide">Real Chat App</h1>
        </div>
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-white">{user?.username}</h2>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            />
          </div>
        </div>

        {/* Instagram-Style Story Circles */}
        <div className="px-4 py-2 border-b border-white/5 overflow-x-auto custom-scrollbar flex gap-4 hide-scroll-bar">
          {/* User's own story "Add" button */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group" onClick={() => setShowStoryModal(true)}>
            <div className="relative w-14 h-14 rounded-full p-[2px] bg-white/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-surface border-2 border-black flex items-center justify-center overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg opacity-80">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Plus className="text-white w-6 h-6" />
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Your Story</span>
          </div>

          {/* Online Users Stories */}
          {users.filter(u => onlineUsers.includes(u._id) || u.status === "online").map((u) => (
            <motion.div
              key={`story-${u._id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
              onClick={() => setActiveChat(u)}
            >
              {/* Animated Gradient Border */}
              <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500">
                <div className="w-full h-full rounded-full bg-surface border-2 border-black flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white font-medium text-lg">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-white font-medium truncate w-14 text-center">{u.username.split(" ")[0]}</span>
            </motion.div>
          ))}
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
          ) : (
            users.map((u) => {
              const isOnline = onlineUsers.includes(u._id) || u.status === "online";
              const isActive = activeChat?._id === u._id;
              return (
                <motion.div
                  key={u._id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  onClick={() => setActiveChat(u)}
                  className={cn(
                    "p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-white/5 group",
                    isActive && "bg-white/10 border-l-2 border-primary shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                  )}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-white font-medium shadow-md group-hover:shadow-lg transition-shadow">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate group-hover:text-primary transition-colors">{u.username}</h3>
                    <p className="text-xs text-gray-400 truncate">
                      {isOnline ? (
                        <span className="text-green-400/90 font-medium">Online</span>
                      ) : "Offline"}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
        
        {/* Copyright Footer */}
        <div className="p-3 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500/80 font-medium tracking-[0.15em] uppercase">
            Designed by BESETTY SHUBHAM
          </p>
        </div>
      </div>
      {showStoryModal && <AddStoryModal onClose={() => setShowStoryModal(false)} />}
    </>
  );
}
