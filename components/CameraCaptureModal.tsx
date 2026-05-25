"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RefreshCcw, Zap, Send, Download } from "lucide-react";
import { useSocketStore } from "@/store/useSocketStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

export default function CameraCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flash, setFlash] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  
  const { socket } = useSocketStore();
  const { user } = useAuthStore();
  const { activeChat } = useChatStore();

  useEffect(() => {
    (window as any).openCameraModal = () => setIsOpen(true);
    return () => {
      if ((window as any).openCameraModal) {
         delete (window as any).openCameraModal;
      }
    };
  }, []);

  const capture = useCallback(() => {
    if (flash) {
       const flashEl = document.getElementById('camera-flash');
       if (flashEl) {
         flashEl.style.opacity = '1';
         setTimeout(() => { flashEl.style.opacity = '0'; }, 150);
       }
    }
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) setImgSrc(imageSrc);
    }, flash ? 150 : 0);
  }, [webcamRef, flash]);

  const sendPhoto = () => {
    if (!imgSrc || !activeChat || !user || !socket) return;

    socket.emit("send_message", {
      sender: user._id,
      receiver: activeChat._id,
      text: "",
      attachment: {
        type: 'image',
        url: imgSrc,
        name: 'camera_capture.jpg',
      }
    });

    setIsOpen(false);
    setImgSrc(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[200] bg-black flex flex-col"
      >
        {/* Flash Element */}
        <div id="camera-flash" className="fixed inset-0 bg-white opacity-0 pointer-events-none z-[300] transition-opacity duration-150"></div>

        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <button onClick={() => { setIsOpen(false); setImgSrc(null); }} className="p-3 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all">
            <X size={24} />
          </button>
          
          {!imgSrc && (
            <div className="flex gap-4">
              <button onClick={() => setFlash(!flash)} className={`p-3 rounded-full backdrop-blur-md transition-all ${flash ? 'bg-yellow-500/80 text-white' : 'bg-black/50 text-white hover:bg-black/80'}`}>
                <Zap size={24} />
              </button>
              <button onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")} className="p-3 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all">
                <RefreshCcw size={24} />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
          {imgSrc ? (
            <img src={imgSrc} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8 z-10">
          {imgSrc ? (
            <>
              <button onClick={() => setImgSrc(null)} className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all">
                <RefreshCcw size={28} />
              </button>
              <button onClick={sendPhoto} className="p-6 bg-primary hover:bg-primary/90 text-white rounded-full shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all transform hover:scale-110 active:scale-95">
                <Send size={32} className="ml-1" />
              </button>
            </>
          ) : (
            <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
               <div className="w-16 h-16 bg-white rounded-full"></div>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
