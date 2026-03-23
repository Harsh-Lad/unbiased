"use client";

import { motion } from "framer-motion";

interface SpeechBubbleProps {
  children: React.ReactNode;
  bgColor: string;
  isRight?: boolean;
}

export function SpeechBubble({ children, bgColor, isRight = false }: SpeechBubbleProps) {
  return (
    <motion.div
      className={`relative max-w-[85%] px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm
        ${bgColor}
        ${isRight ? "rounded-br-md" : "rounded-bl-md"}`}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 22,
        stiffness: 260,
        mass: 0.4,
      }}
    >
      {children}
    </motion.div>
  );
}
