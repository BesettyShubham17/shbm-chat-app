import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Video } from "lucide-react";
import { useSocketStore } from "@/store/useSocketStore";
import { useAuthStore } from "@/store/useAuthStore";

interface AddStoryModalProps {
  onClose: () => void;
}

export default function AddStoryModal({ onClose }: AddStoryModalProps) {
  const { socket } = useSocketStore();
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isVideo, setIsVideo] = useState(false);

  // Generate preview URL when file changes
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setIsVideo(file.type.startsWith("video"));
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleSubmit = () => {
    if (!socket || !user || !file) return;
    // For simplicity, we emit the file name and type. In a real app, you'd upload the file to the server.
    socket.emit("new_story", {
      userId: user._id,
      name: file.name,
      type: file.type,
      // You could also send a base64 representation if needed.
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: -20 }}
          className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md relative"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-semibold text-white mb-4 text-center">
            Add a Story
          </h2>
          <div className="flex flex-col items-center space-y-4">
            <label className="cursor-pointer flex flex-col items-center bg-black/30 hover:bg-black/50 transition-colors p-4 rounded-xl w-full">
              <Upload size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Click to select image or video</span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {preview && (
              <div className="w-full max-w-sm rounded-xl overflow-hidden border border-white/10">
                {isVideo ? (
                  <video src={preview} controls className="w-full" />
                ) : (
                  <img src={preview} alt="preview" className="w-full object-cover" />
                )}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!file}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-xl disabled:opacity-50"
            >
              Post Story
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
