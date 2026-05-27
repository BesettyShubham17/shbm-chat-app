"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocketStore } from "@/store/useSocketStore";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { Loader2 } from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";

import RightSidebar from "@/components/RightSidebar";

export default function Home() {
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com"}/api/users/me`, {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (error) {
        setUser(null);
        router.push("/splash");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user, connectSocket, disconnectSocket]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden relative">
      <Sidebar />
      <ChatArea />
      <RightSidebar />
    </div>
  );
}