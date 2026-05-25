"use client";

import { useChatStore } from "@/store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, FileText, Link2, Bell, Ban, Trash2, Users, Search } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function RightSidebar() {
  const { rightSidebarOpen, toggleRightSidebar, activeChat, messages } = useChatStore();

  if (!activeChat) return null;

  return (
    <AnimatePresence>
      {rightSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full border-l border-white/5 bg-surface/30 backdrop-blur-md flex flex-col overflow-hidden whitespace-nowrap z-20"
        >
          {/* Header */}
          <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-white">Details</h2>
            <div className="flex items-center gap-2">
              <button onClick={toggleRightSidebar} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
              <LogoutButton />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col items-center">
            
            {/* Profile Info */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-3xl text-white font-bold shadow-2xl mb-4 relative">
              {activeChat.avatar || activeChat.username.charAt(0).toUpperCase()}
              {activeChat.status === "online" && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-background rounded-full"></div>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{activeChat.username}</h3>
            <p className="text-sm text-gray-400 mb-6">{(activeChat as any).email || (activeChat as any).isBot ? "AI Assistant" : "User"}</p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 w-full mb-8">
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                  <Bell size={18} />
                </div>
                <span className="text-[10px] text-gray-400">Mute</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                  <Search size={18} />
                </div>
                <span className="text-[10px] text-gray-400">Search</span>
              </div>
            </div>

            {/* Analytics / Stats */}
            <div className="w-full bg-black/20 rounded-2xl p-4 mb-6 border border-white/5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Chat Analytics</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Total Messages</span>
                <span className="text-sm font-bold text-primary">{messages.length}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                <div className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full" style={{ width: `${Math.min((messages.length / 100) * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* Shared Media Tabs (Placeholder for now) */}
            <div className="w-full">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shared Content</h4>
              
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors mb-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><ImageIcon size={16} /></div>
                  <span className="text-sm text-gray-300">Media</span>
                </div>
                <span className="text-xs text-gray-500">0</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors mb-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><FileText size={16} /></div>
                  <span className="text-sm text-gray-300">Docs</span>
                </div>
                <span className="text-xs text-gray-500">0</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-400 rounded-lg"><Link2 size={16} /></div>
                  <span className="text-sm text-gray-300">Links</span>
                </div>
                <span className="text-xs text-gray-500">0</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="w-full mt-auto pt-6">
              <button className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium">
                <Ban size={16} /> Block User
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


