"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const bgControls = useAnimation();
  const logoControls = useAnimation();
  const cameraControls = useAnimation();
  const sweepControls = useAnimation();
  const router = useRouter();
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    async function sequence() {
      // 0–1 sec: Soft background glow slowly activates
      bgControls.start("activate");

      await new Promise(r => setTimeout(r, 1000));

      // 1–2 sec: Image appears blurred, scale 0.4 -> 1.0, cinematic zoom
      await logoControls.start("appear");

      // 2–3 sec: 3D tilt, gold light sweep, floating motion, pulse
      sweepControls.start("sweep");
      logoControls.start("floatAndTilt");

      await new Promise(r => setTimeout(r, 1000));

      // 3–5 sec: Camera zoom in, background depth movement, breathing
      cameraControls.start("zoomIn");
      bgControls.start("deepMove");

      await new Promise(r => setTimeout(r, 2000));

      // 5–6 sec: Message dots and typing effect
      setShowText(true);
      await new Promise(r => setTimeout(r, 1500));

      // 6–7 sec: Smooth transition into login screen
      cameraControls.start("transitionOut");
      await new Promise(r => setTimeout(r, 800));

      router.replace("/login");
    }
    sequence();
  }, [bgControls, logoControls, sweepControls, cameraControls, router]);

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 5 + 3,
  }));

  return (
    <motion.div 
      className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center perspective-[1000px]"
      initial={{ opacity: 1 }}
      animate={cameraControls}
      variants={{
        zoomIn: { scale: 1.05, transition: { duration: 2, ease: "easeInOut" } },
        transitionOut: { scale: 1.5, opacity: 0, filter: "blur(20px)", transition: { duration: 0.8, ease: "easeIn" } }
      }}
    >
      {/* Background Gradients & Particles */}
      <motion.div
        initial="hidden"
        animate={bgControls}
        variants={{
          hidden: { opacity: 0 },
          activate: { opacity: 1, transition: { duration: 1, ease: "easeIn" } },
          deepMove: { scale: 1.2, rotate: 5, transition: { duration: 3, ease: "easeInOut" } }
        }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2a0845]/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#d4af37]/10 rounded-full blur-[150px]" />
        
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0], 
              y: -100,
              x: Math.random() * 50 - 25
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
            className="absolute rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]"
            style={{
              left: `${p.x}%`,
              top: `${p.y + 10}%`,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </motion.div>

      {/* Hero Image Container */}
      <motion.div
        className="relative z-10 perspective-[1000px]"
        initial="hidden"
        animate={logoControls}
        variants={{
          hidden: { opacity: 0, scale: 0.4, filter: "blur(20px)" },
          appear: { 
            opacity: 1, 
            scale: 1.0, 
            filter: "blur(0px)",
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
          },
          floatAndTilt: {
            y: [-10, 10, -10],
            rotateX: [5, -5, 5],
            rotateY: [-5, 5, -5],
            filter: ["drop-shadow(0px 0px 0px rgba(212,175,55,0))", "drop-shadow(0px 0px 40px rgba(212,175,55,0.4))", "drop-shadow(0px 0px 20px rgba(212,175,55,0.2))"],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
        }}
      >
        <div className="relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/shbm_logo.jpeg"
            alt="SHBM APP"
            fill
            className="object-cover"
            priority
          />
          
          {/* Gold light sweep */}
          <motion.div
            initial={{ x: "-150%", skewX: -20 }}
            animate={sweepControls}
            variants={{
              sweep: {
                x: ["-150%", "150%"],
                transition: { duration: 1.5, ease: "easeInOut" }
              }
            }}
            className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"
          />

          {/* Fake Crown Emit Overlay (Positioned roughly where crown is) */}
          <motion.div
            animate={sweepControls}
            variants={{
              sweep: {
                opacity: [0, 1, 0],
                scale: [0.8, 1.5, 0.8],
                transition: { delay: 0.5, duration: 1, ease: "easeOut" }
              }
            }}
            className="absolute top-[10%] left-[30%] right-[30%] h-[30%] bg-[#d4af37]/30 blur-[20px] mix-blend-screen rounded-full"
          />
        </div>
      </motion.div>

      {/* Typing effect and Dots */}
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute bottom-32 flex flex-col items-center gap-4 z-20"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]"
                />
              ))}
            </div>
            
            {/* Typewriter Text */}
            <div className="text-[#d4af37] font-medium tracking-[0.2em] text-sm uppercase overflow-hidden whitespace-nowrap">
              <motion.span
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="inline-block"
              >
                Connecting conversations...
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
