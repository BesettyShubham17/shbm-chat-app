"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout request failed", e);
    }
    logout();
    router.push("/login");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogout}
      className="p-2.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all shadow-sm"
    >
      <XCircle size={20} />
    </motion.button>
  );
}
