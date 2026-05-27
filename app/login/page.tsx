"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Lock, Mail } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com"}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      setUser(res.data);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass-panel rounded-3xl p-8 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <AnimatedLogo width={80} height={80} withGlow={true} />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Welcome Back
            </h1>
            <p className="text-gray-400 mt-2">Sign in to continue to Real Chat App</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400 pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 transition-all focus:neon-glow"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400 pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 transition-all focus:neon-glow"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] mt-6 neon-glow"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:text-accent transition-colors font-medium">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-xs text-gray-500/80 font-medium tracking-[0.2em] uppercase drop-shadow-sm">
          Designed by BESETTY SHUBHAM
        </p>
      </div>
    </div>
  );
}
