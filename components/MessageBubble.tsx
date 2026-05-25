import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Reply, Edit2, Trash2, Download, Image as ImageIcon, FileText, MapPin, User, Video, Mic, Link2, CheckCheck, X } from "lucide-react";
import dynamic from "next/dynamic";
const LocationMapCard = dynamic(() => import("./LocationMapCard"), { ssr: false });
import { useSocketStore } from "@/store/useSocketStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Message, useChatStore } from "@/store/useChatStore";

const EMOJIS = ["❤️", "😂", "👍", "🔥", "😮", "👀"];

interface MessageBubbleProps {
  msg: Message;
  isMe: boolean;
  showAvatar: boolean;
  activeChatName: string;
}

export default function MessageBubble({ msg, isMe, showAvatar, activeChatName }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(msg.text);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const { socket } = useSocketStore();
  const { user } = useAuthStore();
  const { setReplyingTo, messages } = useChatStore();

  const handleReaction = (emoji: string) => {
    if (!socket || !user) return;
    socket.emit("message_reaction", { messageId: msg._id, emoji, sender: user._id });
  };

  const handleDelete = () => {
    if (!socket) return;
    socket.emit("message_delete", { messageId: msg._id });
  };

  const handleEditSubmit = () => {
    if (!socket || editValue.trim() === msg.text) {
      setIsEditing(false);
      return;
    }
    socket.emit("message_edit", { messageId: msg._id, newText: editValue.trim() });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(msg.text);
    }
  };

  const repliedMsg = msg.replyTo ? messages.find(m => m._id === msg.replyTo) : null;

  // Auto-detect URLs to render rich link previews
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hasLink = urlRegex.test(msg.text);
  
  // Format text to highlight links
  const renderTextWithLinks = (text: string) => {
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{part}</a>;
      }
      return part;
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`flex gap-3 relative group ${isMe ? "justify-end" : "justify-start"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isMe && showAvatar && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex-shrink-0 flex items-center justify-center text-xs text-white shadow-lg mt-auto border border-white/5">
            {activeChatName.charAt(0).toUpperCase()}
          </div>
        )}
        {!isMe && !showAvatar && <div className="w-8 flex-shrink-0" />}

        <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col relative`}>
          
          {repliedMsg && (
            <div className={`mb-1 px-3 py-2 rounded-xl text-xs flex flex-col gap-1 ${isMe ? "bg-white/5 self-end mr-2" : "bg-black/20 self-start ml-2"} border-l-2 border-primary opacity-80 max-w-full backdrop-blur-sm`}>
              <span className="font-semibold text-primary">{repliedMsg.sender === user?._id ? "You" : activeChatName}</span>
              <span className="truncate text-gray-300">{repliedMsg.text}</span>
            </div>
          )}

          <div
            onDoubleClick={() => handleReaction("❤️")}
            className={`px-5 py-3 rounded-2xl shadow-lg relative transition-all cursor-pointer ${
              msg.isDeleted
                ? "bg-transparent border border-white/10 text-gray-500 italic"
                : isMe
                ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-tr-sm border border-white/10"
                : "bg-surface border border-white/5 text-gray-100 rounded-tl-sm backdrop-blur-xl"
            }`}
          >
            {/* Heart burst animation container can be added here if needed */}
            {msg.isDeleted ? (
              <p className="text-sm">This message was deleted.</p>
            ) : isEditing ? (
              <input
                autoFocus
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleEditSubmit}
                className="bg-black/30 text-white px-2 py-1 rounded w-full focus:outline-none min-w-[200px] border border-primary/50"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {/* Text Content */}
                {msg.text && (
                  <p className="leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(msg.text)}</p>
                )}

                {/* Attachment Handling */}
                {msg.attachment && (
                  <div className="mt-2 w-full max-w-sm rounded-xl overflow-hidden border border-white/10 bg-black/20">
                    
                    {msg.attachment.type === 'image' && msg.attachment.url && (
                      <div className="relative group/img cursor-zoom-in" onClick={() => setIsImageZoomed(true)}>
                        <img src={msg.attachment.url} alt="attachment" className="w-full max-h-[300px] object-cover transition-transform duration-300 group-hover/img:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                           <ImageIcon className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" size={32} />
                        </div>
                      </div>
                    )}
                    
                    {msg.attachment.type === 'location' && msg.attachment.url && (
                      <LocationMapCard 
                        lat={parseFloat(msg.attachment.url.split(',')[0])} 
                        lng={parseFloat(msg.attachment.url.split(',')[1])} 
                        isLive={msg.attachment.name?.includes('Live') || false} 
                      />
                    )}

                    {['document', 'video', 'audio', 'location', 'contact'].includes(msg.attachment.type) && (
                      <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group/file">
                        <div className="flex items-center gap-3 truncate">
                          <div className={`p-2 rounded-lg ${
                            msg.attachment.type === 'document' ? 'bg-purple-500/20 text-purple-400' :
                            msg.attachment.type === 'video' ? 'bg-pink-500/20 text-pink-400' :
                            msg.attachment.type === 'audio' ? 'bg-cyan-500/20 text-cyan-400' :
                            msg.attachment.type === 'location' ? 'bg-green-500/20 text-green-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {msg.attachment.type === 'document' && <FileText size={20} />}
                            {msg.attachment.type === 'video' && <Video size={20} />}
                            {msg.attachment.type === 'audio' && <Mic size={20} />}
                            {msg.attachment.type === 'location' && <MapPin size={20} />}
                            {msg.attachment.type === 'contact' && <User size={20} />}
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-white truncate">{msg.attachment.name}</span>
                            <span className="text-xs text-gray-400">
                              {msg.attachment.size ? (msg.attachment.size / 1024 / 1024).toFixed(2) + ' MB' : 'Attachment'}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 group-hover/file:text-white group-hover/file:bg-white/10 p-2 rounded-full transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Link Preview Mockup */}
                {hasLink && !msg.attachment && (
                  <div className="mt-2 w-full max-w-sm rounded-xl overflow-hidden border border-white/10 bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                     <div className="h-32 bg-gradient-to-br from-blue-900/40 to-purple-900/40 flex items-center justify-center">
                        <Link2 size={32} className="text-white/50" />
                     </div>
                     <div className="p-3">
                        <h4 className="text-sm font-bold text-white truncate">Website Preview</h4>
                        <p className="text-xs text-gray-400 truncate">Click to open this link in a new tab</p>
                     </div>
                  </div>
                )}
              </div>
            )}

            {/* Reactions */}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className={`absolute -bottom-4 ${isMe ? "right-2" : "left-2"} flex gap-1 z-10`}>
                {Array.from(new Set(msg.reactions.map(r => r.emoji))).map((emoji) => (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    key={emoji}
                    className="bg-surface border border-white/10 rounded-full px-1.5 py-0.5 text-xs shadow-lg backdrop-blur-xl flex items-center gap-1 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji} <span className="text-[10px] text-gray-300 font-semibold">{msg.reactions!.filter(r => r.emoji === emoji).length}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className={`flex items-center gap-2 mt-1.5 px-1 ${msg.reactions && msg.reactions.length > 0 ? "pt-2" : ""}`}>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              {format(new Date(msg.createdAt), "HH:mm")}
            </span>
            {msg.isEdited && !msg.isDeleted && <span className="text-[10px] text-gray-500 italic">edited</span>}
            {isMe && !msg.isDeleted && (
              <CheckCheck size={14} className="text-cyan-400 ml-1" />
            )}
          </div>

          {/* Hover Menu */}
          <AnimatePresence>
            {isHovered && !msg.isDeleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                className={`absolute top-0 ${isMe ? "-left-44" : "-right-44"} flex items-center gap-1 bg-surface border border-white/10 rounded-xl p-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-20`}
              >
                {EMOJIS.slice(0,4).map(e => (
                  <button
                    key={e}
                    onClick={() => handleReaction(e)}
                    className="hover:scale-125 hover:-translate-y-1 transition-all duration-200 p-1"
                  >
                    {e}
                  </button>
                ))}
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <button onClick={() => setReplyingTo(msg)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Reply size={14} />
                </button>
                {isMe && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={handleDelete} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Lightbox Modal for Images */}
      <AnimatePresence>
        {isImageZoomed && msg.attachment?.url && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={msg.attachment.url} 
              alt="Zoomed" 
              className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
