"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface AnimatedLogoProps {
  width?: number;
  height?: number;
  className?: string;
  withGlow?: boolean;
}

export default function AnimatedLogo({
  width = 64,
  height = 64,
  className = "",
  withGlow = false,
}: AnimatedLogoProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {withGlow && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-primary/30 blur-xl z-0"
        />
      )}
      <div className="relative z-10 rounded-[10px] overflow-hidden">
        <Image
          src="/shbm_logo.jpeg"
          alt="Real Chat App — By Shubham Besetty"
          width={width}
          height={height}
          className="object-cover drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
          priority
        />
      </div>
    </motion.div>
  );
}
