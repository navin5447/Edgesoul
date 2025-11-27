"use client";

import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { Message } from "@/lib/types/chat";
import { Theme } from "@/hooks/useTheme";
import { useTheme } from "@/context/ThemeContext";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isTyping?: boolean;
  theme: Theme;
}

export default function MessageList({ messages, isLoading, isTyping, theme }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);
  const { theme: themeConfig } = useTheme();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const hasNewMessage = messages.length > prevMessageCountRef.current;
    
    if (hasNewMessage) {
      // Instant scroll for first message, smooth for subsequent
      scrollToBottom(messages.length === 1 ? 'auto' : 'smooth');
    }
    
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Scroll when typing indicator appears
  useEffect(() => {
    if (isTyping) {
      setTimeout(() => scrollToBottom('smooth'), 100);
    }
  }, [isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div 
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
              boxShadow: '0 4px 14px rgba(53, 139, 255, 0.35)'
            }}
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: '#0f172a' }}
          >
            Welcome to EdgeSoul
          </h2>
          <p 
            className="text-base sm:text-lg"
            style={{ color: '#64748b' }}
          >
            Your emotion-aware AI assistant
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
            <div 
              className="rounded-2xl p-4 text-left backdrop-blur-2xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer'
              }}
            >
              <div className="font-semibold mb-1" style={{ color: '#0f172a' }}>
                💬 Ask me anything
              </div>
              <div style={{ color: '#64748b' }}>
                From coding help to life advice
              </div>
            </div>
            <div 
              className="rounded-2xl p-4 text-left backdrop-blur-2xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer'
              }}
            >
              <div className="font-semibold mb-1" style={{ color: '#0f172a' }}>
                🎭 Emotion detection
              </div>
              <div style={{ color: '#64748b' }}>
                I understand how you feel
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-6 scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="container mx-auto max-w-4xl space-y-4">
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            theme={theme}
            index={index}
          />
        ))}
        
        {/* Modern Typing Indicator */}
        {isTyping && (
          <TypingIndicator theme={theme} />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
