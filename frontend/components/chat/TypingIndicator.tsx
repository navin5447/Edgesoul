'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Theme } from '@/hooks/useTheme';

interface TypingIndicatorProps {
  theme: Theme;
}

export default function TypingIndicator({ theme }: TypingIndicatorProps) {
  // Animation for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  // Staggered bounce animation for dots
  const dotVariants = {
    start: {
      y: 0
    },
    end: {
      y: -8,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3"
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
          boxShadow: '0 4px 12px rgba(53, 139, 255, 0.3)'
        }}
      >
        <Bot className="h-5 w-5 text-white" />
      </motion.div>

      {/* Typing Bubble */}
      <motion.div
        className="rounded-2xl px-5 py-3.5 backdrop-blur-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              variants={dotVariants}
              initial="start"
              animate="end"
              transition={{
                delay: index * 0.15,
                duration: 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
              className="h-2 w-2 rounded-full"
              style={{ background: '#358BFF' }}
            />
          ))}
        </div>
      </motion.div>

      {/* Optional text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="self-center text-xs"
        style={{ color: '#64748b' }}
      >
        EdgeSoul is typing...
      </motion.div>
    </motion.div>
  );
}
