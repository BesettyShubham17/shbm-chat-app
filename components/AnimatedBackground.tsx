"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 1000 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#050505]">
      {/* Dynamic Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      
      {/* Glassmorphism base layer */}
      <div className="absolute inset-0 backdrop-blur-[100px] z-0"></div>

      {/* Gradient Mesh Layer 1 - Neon Purple Orb */}
      <motion.div
        animate={{
          x: mousePosition.x * -3,
          y: mousePosition.y * -3,
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100, opacity: { duration: 8, repeat: Infinity }, scale: { duration: 10, repeat: Infinity } }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-600/30 blur-[150px] mix-blend-screen z-[-1]"
      ></motion.div>

      {/* Gradient Mesh Layer 2 - Deep Blue/Indigo Orb */}
      <motion.div
        animate={{
          x: mousePosition.x * 4,
          y: mousePosition.y * 4,
          scale: [1, 1.1, 1],
        }}
        transition={{ type: "spring", damping: 40, stiffness: 80, scale: { duration: 12, repeat: Infinity } }}
        className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-700/20 blur-[180px] mix-blend-screen z-[-1]"
      ></motion.div>

      {/* Core Glowing Orb - Primary Color */}
      <motion.div
        animate={{
          x: mousePosition.x * 1.5,
          y: mousePosition.y * 1.5,
          rotate: [0, 360],
        }}
        transition={{ type: "spring", damping: 60, stiffness: 90, rotate: { duration: 50, repeat: Infinity, ease: "linear" } }}
        className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-indigo-600/15 blur-[120px] mix-blend-screen z-[-1]"
      ></motion.div>

      {/* Secondary Core - Cyan Glow */}
      <motion.div
        animate={{
          x: mousePosition.x * -1,
          y: mousePosition.y * -2,
        }}
        transition={{ type: "spring", damping: 70, stiffness: 80 }}
        className="absolute top-[60%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-cyan-500/10 blur-[100px] mix-blend-screen z-[-1]"
      ></motion.div>

      {/* Floating Particles - Cinematic Ambient Motion */}
      {[...Array(25)].map((_, i) => {
        const randomX = Math.random() * windowSize.width;
        const randomY = Math.random() * windowSize.height;
        return (
          <motion.div
            key={i}
            initial={{
              opacity: Math.random() * 0.4 + 0.1,
              x: randomX,
              y: randomY,
              scale: Math.random() * 0.8 + 0.2,
            }}
            animate={{
              y: [randomY, randomY - (Math.random() * 200 + 100)],
              x: [randomX, randomX + (Math.random() * 100 - 50)],
              opacity: [0, Math.random() * 0.6 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 10,
            }}
            className="absolute w-1.5 h-1.5 bg-white/60 rounded-full shadow-[0_0_12px_rgba(255,255,255,1)]"
          />
        );
      })}
    </div>
  );
}
