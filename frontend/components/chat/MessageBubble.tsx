"use client";

import React from "react";
import { User, Bot } from "lucide-react";
import { Message } from "@/lib/types/chat";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Theme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface MessageBubbleProps {
  message: Message;
  theme: Theme;
  index: number;
}

// Emotion emoji mapping
const emotionEmojis: Record<string, string> = {
  joy: "😊",
  sadness: "😢",
  anger: "😡",
  fear: "😱",
  surprise: "😲",
  love: "❤️",
  neutral: "😐",
};

export default function MessageBubble({ message, theme, index }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const emotionEmoji = message.emotion ? emotionEmojis[message.emotion.primary.toLowerCase()] : null;
  const { theme: themeConfig } = useTheme();

  // Slide up animation from bottom - ChatGPT style
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar with scale animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: isUser 
            ? 'linear-gradient(135deg, #5C8DFF 0%, #8FB4FF 100%)' 
            : 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
          boxShadow: '0 4px 12px rgba(53, 139, 255, 0.3)'
        }}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </motion.div>

      {/* Content */}
      <div className={`flex-1 ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        {/* Message Bubble with hover effect */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[80%] transition-all backdrop-blur-2xl"
          style={{
            background: isUser 
              ? 'linear-gradient(135deg, #5C8DFF 0%, #8FB4FF 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
            color: isUser ? 'white' : '#0f172a',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.7)'
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="ml-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="ml-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code 
                        className="rounded px-1.5 py-0.5"
                        style={{ backgroundColor: 'rgba(53, 139, 255, 0.15)', color: '#358BFF' }}
                      >
                        {children}
                      </code>
                    ) : (
                      <code 
                        className="block rounded-lg p-3 my-2 overflow-x-auto"
                        style={{ backgroundColor: 'rgba(53, 139, 255, 0.1)', color: '#0f172a' }}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </motion.div>
        
        {/* Metadata with fade-in */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`flex items-center gap-2 px-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          <span 
            className="text-xs"
            style={{ color: '#64748b' }}
          >
            {format(message.timestamp, "HH:mm")}
          </span>
          
          {/* Emotion Icon for AI messages */}
          {emotionEmoji && !isUser && (
            <div className="flex items-center gap-1">
              <span className="text-lg" title={`Emotion: ${message.emotion?.primary}`}>
                {emotionEmoji}
              </span>
              {message.emotion && (
                <span 
                  className="text-xs"
                  style={{ color: '#64748b' }}
                >
                  {Math.round(message.emotion.confidence)}%
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
