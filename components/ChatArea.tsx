"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { MessageSquare, Menu, Video as VideoIcon, Phone, Camera } from "lucide-react";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";
import VideoCallModal from "./VideoCallModal";
import CameraCaptureModal from "./CameraCaptureModal";

export default function ChatArea() {
  const { user } = useAuthStore();
  const { activeChat, messages, setMessages, typingUsers, toggleRightSidebar } = useChatStore();
  const { onlineUsers } = useSocketStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const fetchMessages = async () => {
    if (!activeChat) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com"}/api/messages/${activeChat._id}`, {
        withCredentials: true,
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black/20">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mb-8 neon-glow backdrop-blur-xl border border-white/10"
        >
          <MessageSquare className="w-12 h-12 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3">
          Welcome to ChatSphere
        </h2>
        <p className="text-gray-400 text-lg">Select a conversation or Ask AI to get started</p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(activeChat._id) || activeChat.status === "online";
  const isTyping = typingUsers.has(activeChat._id);

  return (
    <div className="flex-1 flex flex-col h-full bg-black/40 relative">
      <VideoCallModal />
      <CameraCaptureModal />
      
      {/* Chat Header */}
      <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-surface/80 backdrop-blur-xl z-10 sticky top-0">
        <div className="flex items-center gap-4 cursor-pointer" onClick={toggleRightSidebar}>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-white font-medium shadow-md">
              {activeChat.avatar || activeChat.username.charAt(0).toUpperCase()}
            </div>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white tracking-wide">{activeChat.username}</h2>
            <p className="text-sm text-primary font-medium">
              {isTyping ? (activeChat._id === "bot-ai-assistant" ? "AI is thinking..." : "typing...") : isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => (window as any).initiateCall?.()} className="p-2.5 text-gray-400 hover:text-blue-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all shadow-sm">
            <VideoIcon size={20} />
          </button>
          <button onClick={() => (window as any).openCameraModal?.()} className="p-2.5 text-gray-400 hover:text-pink-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all shadow-sm">
            <Camera size={20} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <button onClick={toggleRightSidebar} className="p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all shadow-sm">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-2 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.sender === user?._id;
            const showAvatar = idx === 0 || messages[idx - 1].sender !== msg.sender;
            return (
              <MessageBubble 
                key={msg._id} 
                msg={msg} 
                isMe={isMe} 
                showAvatar={showAvatar} 
                activeChatName={activeChat.username} 
              />
            );
          })}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex-shrink-0 flex items-center justify-center text-xs text-white mt-auto">
              {activeChat.avatar || activeChat.username.charAt(0).toUpperCase()}
            </div>
            <div className="px-5 py-4 rounded-2xl bg-surface border border-white/5 rounded-tl-sm flex gap-1.5 items-center backdrop-blur-md">
              <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary/80 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-primary/80 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-primary/80 rounded-full" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <MessageInput />
    </div>
  );
}
