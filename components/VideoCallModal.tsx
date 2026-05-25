"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { useSocketStore } from "@/store/useSocketStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChatStore";

export default function VideoCallModal() {
  const { user } = useAuthStore();
  const { activeChat } = useChatStore();
  const { socket } = useSocketStore();
  
  const { 
    isReceivingCall, caller, callerName, callerSignal, 
    callAccepted, callEnded, localStream, remoteStream,
    setLocalStream, setRemoteStream, setCallAccepted, endCallState 
  } = useCallStore();

  const [isCalling, setIsCalling] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Expose a global function to initiate a call from ChatArea
    (window as any).initiateCall = () => {
      if (!activeChat || !user || !socket) return;
      setIsCalling(true);
      
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (myVideo.current) myVideo.current.srcObject = stream;

          const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
          connectionRef.current = peer;

          stream.getTracks().forEach(track => peer.addTrack(track, stream));

          peer.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice_candidate", { to: activeChat._id, candidate: event.candidate });
            }
          };

          peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (userVideo.current) userVideo.current.srcObject = event.streams[0];
          };

          peer.createOffer().then(offer => {
            peer.setLocalDescription(offer);
            socket.emit("call_user", {
              userToCall: activeChat._id,
              signalData: offer,
              from: user._id,
              name: user.username,
            });
          });
        })
        .catch((err) => console.error("Error accessing media devices.", err));
    };

    return () => {
      delete (window as any).initiateCall;
    };
  }, [activeChat, user, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call_accepted", async (signal) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on("ice_candidate", async (candidate) => {
      if (connectionRef.current) {
        await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("call_ended", () => {
      leaveCall();
    });

    return () => {
      socket.off("call_accepted");
      socket.off("ice_candidate");
      socket.off("call_ended");
    };
  }, [socket]);

  const answerCall = async () => {
    if (!socket || !callerSignal || !caller) return;

    setCallAccepted(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (myVideo.current) myVideo.current.srcObject = stream;

      const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      connectionRef.current = peer;

      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", { to: caller, candidate: event.candidate });
        }
      };

      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (userVideo.current) userVideo.current.srcObject = event.streams[0];
      };

      await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer_call", { signal: answer, to: caller });

    } catch (err) {
      console.error("Error answering call", err);
    }
  };

  const leaveCall = () => {
    if (socket) {
      socket.emit("end_call", { to: caller || activeChat?._id });
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    
    endCallState();
    setIsCalling(false);
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !micActive;
      setMicActive(!micActive);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !videoActive;
      setVideoActive(!videoActive);
    }
  };

  // Render Incoming Call Modal
  if (isReceivingCall && !callAccepted) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Animated Background Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <motion.div animate={{ scale: [1, 2, 3], opacity: [0.8, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} className="absolute w-40 h-40 rounded-full border-4 border-primary/50" />
             <motion.div animate={{ scale: [1, 2, 3], opacity: [0.8, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6, ease: "easeOut" }} className="absolute w-40 h-40 rounded-full border-4 border-secondary/50" />
             <motion.div animate={{ scale: [1, 2, 3], opacity: [0.8, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2, ease: "easeOut" }} className="absolute w-40 h-40 rounded-full border-4 border-primary/50" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-5xl text-white font-bold shadow-[0_0_50px_rgba(99,102,241,0.6)]">
               {callerName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="text-center space-y-2">
              <motion.h3 animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl font-bold text-white tracking-wide">{callerName}</motion.h3>
              <p className="text-lg text-primary font-medium tracking-widest uppercase">Incoming Video Call</p>
            </div>
          </div>

          <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-12 z-10">
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={leaveCall} 
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-colors"
            >
              <PhoneOff size={32} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={answerCall} 
              className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-colors"
            >
              <VideoIcon size={32} className="animate-pulse" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render Active Call Modal
  if (isCalling || callAccepted) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center overflow-hidden"
      >
        {/* Remote Video Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteStream ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-4xl text-white font-bold shadow-2xl relative">
                {activeChat?.avatar || activeChat?.username.charAt(0).toUpperCase()}
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50"></div>
              </div>
              <p className="text-xl text-white font-medium">Calling {activeChat?.username}...</p>
            </div>
          )}
        </div>

        {/* Local Video PIP (Picture in Picture) */}
        {localStream && (
          <motion.div 
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute bottom-32 right-8 w-48 h-64 bg-gray-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl cursor-grab active:cursor-grabbing z-10"
          >
            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-surface/50 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
          <button onClick={toggleMic} className={`p-4 rounded-full transition-all ${micActive ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'}`}>
            {micActive ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          
          <button onClick={leaveCall} className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all hover:scale-110 active:scale-95">
            <PhoneOff size={28} />
          </button>

          <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${videoActive ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'}`}>
            {videoActive ? <VideoIcon size={24} /> : <VideoOff size={24} />}
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
