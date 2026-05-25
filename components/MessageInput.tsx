"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Image as ImageIcon, FileText, Link2, MapPin, User, Video, Mic, File as FileIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore, Attachment } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentLocation } from "../lib/location";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  // Live location handling functions
  const startLiveLocation = (minutes: number) => {
    if (!socket || !user || !activeChat) return;
    setLiveLocationActive(true);
    const endTime = Date.now() + minutes * 60 * 1000;
    liveLocationEndRef.current = endTime;
    // Immediately send first location
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const locationAttachment = {
        type: 'location',
        name: `Live Location (${minutes} mins)`,
        url: `${lat},${lng}`,
      } as any;
      socket.emit('send_message', {
        sender: user._id,
        receiver: activeChat._id,
        text: '',
        attachment: locationAttachment,
      });
      setAttachmentPreview(locationAttachment);
    });
    // Set interval to send every 10 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      if (Date.now() > liveLocationEndRef.current) {
        clearInterval(intervalId);
        setLiveLocationActive(false);
        setAttachmentPreview(null);
        return;
      }
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const locationAttachment = {
          type: 'location',
          name: `Live Location (${minutes} mins)`,
          url: `${lat},${lng}`,
        } as any;
        socket.emit('send_message', {
          sender: user._id,
          receiver: activeChat._id,
          text: '',
          attachment: locationAttachment,
        });
        setAttachmentPreview(locationAttachment);
      });
    }, 10000);
    // Store timer ref to allow cleanup
    liveLocationTimerRef.current = intervalId as any;
  };

  const stopLiveLocation = () => {
    if (liveLocationTimerRef.current) {
      clearInterval(liveLocationTimerRef.current as any);
    }
    setLiveLocationActive(false);
    setAttachmentPreview(null);
  };

  // Effect to clean up on component unmount
  useEffect(() => {
    return () => {
      if (liveLocationTimerRef.current) {
        clearInterval(liveLocationTimerRef.current as any);
      }
    };
  }, []);

  // Live location state
  const [liveLocationActive, setLiveLocationActive] = useState(false);
  const liveLocationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveLocationEndRef = useRef<number>(0);
  const [attachmentPreview, setAttachmentPreview] = useState<Attachment | null>(null);
  
  const { user } = useAuthStore();
  const { activeChat, replyingTo, setReplyingTo } = useChatStore();
  const { socket } = useSocketStore();
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!text.trim() && !attachmentPreview) || !activeChat || !user || !socket) return;

    const messageData = {
      sender: user._id,
      receiver: activeChat._id,
      text: text.trim(),
      replyTo: replyingTo ? replyingTo._id : null,
      attachment: attachmentPreview,
    };

    socket.emit("send_message", messageData);
    socket.emit("stop_typing", { sender: user._id, receiver: activeChat._id });
    
    setText("");
    setReplyingTo(null);
    setShowEmoji(false);
    setShowAttachMenu(false);
    setAttachmentPreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!socket || !activeChat || !user) return;
    socket.emit("typing", { sender: user._id, receiver: activeChat._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { sender: user._id, receiver: activeChat._id });
    }, 2000);
  };

  const onEmojiClick = (emojiObject: any) => {
    setText(prev => prev + emojiObject.emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const type = file.type.startsWith('image/') ? 'image' 
                 : file.type.startsWith('video/') ? 'video' 
                 : file.type.startsWith('audio/') ? 'audio' : 'document';
      
      setAttachmentPreview({
        type,
        url: base64, // Using Base64 for demo purposes to avoid backend storage setup
        name: file.name,
        size: file.size,
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const attachMenuVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10, transformOrigin: "bottom left" },
    visible: { opacity: 1, scale: 1, y: 0, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
    exit: { opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 bg-surface/80 backdrop-blur-xl border-t border-white/5 relative z-20">
      
      {/* Replying Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-4xl mx-auto mb-3 px-4 py-2 bg-black/40 border-l-4 border-primary rounded-r-xl flex justify-between items-center"
          >
            <div className="flex flex-col truncate">
              <span className="text-primary text-xs font-bold">Replying to {replyingTo.sender === user?._id ? "yourself" : activeChat?.username}</span>
              <span className="text-gray-300 text-sm truncate">{replyingTo.text}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment Preview */}
      <AnimatePresence>
        {attachmentPreview && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-4xl mx-auto mb-3 px-4 py-3 bg-black/40 border border-white/10 rounded-xl flex justify-between items-center"
          >
            <div className="flex items-center gap-3 truncate">
              {attachmentPreview.type === 'image' && <ImageIcon className="text-primary" size={24} />}
              {attachmentPreview.type === 'document' && <FileIcon className="text-secondary" size={24} />}
              {attachmentPreview.type === 'video' && <Video className="text-pink-500" size={24} />}
              {attachmentPreview.type === 'audio' && <Mic className="text-cyan-500" size={24} />}
              
              <div className="flex flex-col truncate">
                <span className="text-white text-sm font-medium truncate">{attachmentPreview.name}</span>
                <span className="text-gray-500 text-xs">
                  {attachmentPreview.size ? (attachmentPreview.size / 1024 / 1024).toFixed(2) + ' MB' : 'Attachment ready'}
                </span>
              </div>
            </div>
            
            {attachmentPreview.type === 'image' && attachmentPreview.url && (
              <img src={attachmentPreview.url} alt="preview" className="w-12 h-12 object-cover rounded-md mx-2 border border-white/20" />
            )}

            <button onClick={() => setAttachmentPreview(null)} className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-500/10">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 max-w-4xl mx-auto relative">
        
        {/* Emoji Picker Popup */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-16 left-12 shadow-2xl z-50 border border-white/10 rounded-lg overflow-hidden"
            >
              <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Floating Menu */}
        <AnimatePresence>
          {showAttachMenu && (
            <motion.div 
              variants={attachMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute bottom-16 left-0 shadow-2xl z-50 bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 w-[280px]"
            >
              <div className="grid grid-cols-3 gap-4">
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all group-hover:scale-110 shadow-lg group-hover:shadow-blue-500/50">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">Photo</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all group-hover:scale-110 shadow-lg group-hover:shadow-purple-500/50">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">Document</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => {
                   setShowLocationMenu(true);
                   setShowAttachMenu(false);
                }}>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all group-hover:scale-110 shadow-lg group-hover:shadow-green-500/50">
                    <MapPin size={20} />
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">Location</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => {
                   setAttachmentPreview({ type: 'contact', name: 'Contact Card: John Doe' });
                   setShowAttachMenu(false);
                }}>
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all group-hover:scale-110 shadow-lg group-hover:shadow-orange-500/50">
                    <User size={20} />
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">Contact</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all group-hover:scale-110 shadow-lg group-hover:shadow-pink-500/50">
                    <Video size={20} />
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">Video</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all group-hover:scale-110 shadow-lg group-hover:shadow-cyan-500/50">
                    <Mic size={20} />
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">Audio</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Options Modal */}
        <AnimatePresence>
          {showLocationMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-16 left-0 shadow-2xl z-50 bg-surface/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 w-[240px] flex flex-col gap-2"
            >
              <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                 <span className="text-white font-medium text-sm">Share Location</span>
                 <button onClick={() => setShowLocationMenu(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
              </div>
              <button onClick={() => { startLiveLocation(15); setShowLocationMenu(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-red-400 text-sm font-medium flex items-center gap-2 transition-colors">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live for 15 mins
              </button>
              <button onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setAttachmentPreview({ type: 'location', name: 'Live Location (1 hour)', url: `${pos.coords.latitude},${pos.coords.longitude}` });
                    setShowLocationMenu(false);
                  });
                }
              }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-red-400 text-sm font-medium flex items-center gap-2 transition-colors">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live for 1 hour
              </button>
              <button onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setAttachmentPreview({ type: 'location', name: 'Live Location (8 hours)', url: `${pos.coords.latitude},${pos.coords.longitude}` });
                    setShowLocationMenu(false);
                  });
                }
              }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-red-400 text-sm font-medium flex items-center gap-2 transition-colors">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live for 8 hours
              </button>
              <div className="h-px w-full bg-white/10 my-1"></div>
              <button onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setAttachmentPreview({ type: 'location', name: 'Current Location', url: `${pos.coords.latitude},${pos.coords.longitude}` });
                    setShowLocationMenu(false);
                  });
                }
              }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-green-400 text-sm font-medium transition-colors">
                Send Current Location
              </button>
            </motion.div>
          )}
        </AnimatePresence>


        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />

        <button 
          onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmoji(false); }}
          className={`p-3 transition-colors rounded-xl hover:bg-white/10 relative overflow-hidden group ${showAttachMenu ? "text-primary bg-primary/10" : "text-gray-400 hover:text-white"}`}
        >
          <Paperclip size={22} className="group-hover:scale-110 transition-transform" />
        </button>

        <button 
          onClick={() => { setShowEmoji(!showEmoji); setShowAttachMenu(false); }}
          className={`p-3 transition-colors rounded-xl hover:bg-white/10 ${showEmoji ? "text-secondary bg-secondary/10" : "text-gray-400 hover:text-white"}`}
        >
          <Smile size={22} />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all shadow-inner focus:neon-glow"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() && !attachmentPreview}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
