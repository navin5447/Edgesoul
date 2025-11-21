// 2D Animated Avatar with Emotion-Based Expressions
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  emotion?: string;
  size?: number;
  className?: string;
}

// Emotion configurations
const emotionConfig: Record<string, {
  color: string;
  eyeShape: string;
  mouthPath: string;
  animation: any;
  glow: string;
}> = {
  joy: {
    color: 'from-yellow-400 to-orange-400',
    eyeShape: 'M20,35 Q25,30 30,35',
    mouthPath: 'M25,50 Q35,60 45,50',
    animation: {
      y: [0, -5, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    glow: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))'
  },
  sadness: {
    color: 'from-blue-400 to-indigo-500',
    eyeShape: 'M20,35 Q25,38 30,35',
    mouthPath: 'M25,55 Q35,48 45,55',
    animation: {
      y: [0, 2, 0],
      rotate: [-2, 0, -2],
      transition: { duration: 4, repeat: Infinity }
    },
    glow: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.6))'
  },
  anger: {
    color: 'from-red-500 to-orange-600',
    eyeShape: 'M20,33 L30,35',
    mouthPath: 'M25,55 L45,55',
    animation: {
      x: [-2, 2, -2, 2, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 0.5, repeat: Infinity }
    },
    glow: 'drop-shadow(0 0 25px rgba(239, 68, 68, 0.7))'
  },
  fear: {
    color: 'from-purple-400 to-purple-600',
    eyeShape: 'M22,32 Q25,28 28,32',
    mouthPath: 'M30,52 Q35,56 40,52',
    animation: {
      x: [-1, 1, -1, 1, 0],
      y: [-1, 1, -1, 1, 0],
      transition: { duration: 0.3, repeat: Infinity }
    },
    glow: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))'
  },
  surprise: {
    color: 'from-pink-400 to-rose-500',
    eyeShape: 'M22,32 Q25,28 28,32',
    mouthPath: 'M30,50 Q35,55 40,50 Q35,60 30,50 Z',
    animation: {
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: Infinity }
    },
    glow: 'drop-shadow(0 0 20px rgba(244, 114, 182, 0.6))'
  },
  love: {
    color: 'from-pink-500 to-red-500',
    eyeShape: 'M20,35 Q25,32 30,35',
    mouthPath: 'M25,50 Q35,58 45,50',
    animation: {
      scale: [1, 1.05, 1],
      rotate: [0, 3, 0, -3, 0],
      transition: { duration: 2.5, repeat: Infinity }
    },
    glow: 'drop-shadow(0 0 25px rgba(236, 72, 153, 0.8))'
  },
  neutral: {
    color: 'from-gray-400 to-gray-500',
    eyeShape: 'M20,35 Q25,34 30,35',
    mouthPath: 'M30,52 L40,52',
    animation: {
      y: [0, -2, 0],
      transition: { duration: 3, repeat: Infinity }
    },
    glow: 'drop-shadow(0 0 15px rgba(156, 163, 175, 0.5))'
  }
};

export default function Avatar2D({ emotion = 'neutral', size = 120, className = '' }: AvatarProps) {
  const config = emotionConfig[emotion.toLowerCase()] || emotionConfig.neutral;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={config.animation}
    >
      {/* Glow effect background */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-50"
        style={{
          background: `linear-gradient(135deg, ${config.color.replace('from-', '').replace('to-', '')})`,
        }}
      />

      {/* Main avatar container */}
      <svg
        viewBox="0 0 100 100"
        className="relative z-10"
        style={{ filter: config.glow }}
      >
        {/* Head circle */}
        <defs>
          <linearGradient id={`gradient-${emotion}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.color.split(' ')[0].replace('from-', '')} />
            <stop offset="100%" stopColor={config.color.split(' ')[2]} />
          </linearGradient>
        </defs>

        {/* Face base */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill={`url(#gradient-${emotion})`}
          className="transition-all duration-300"
        />

        {/* Left eye */}
        <g>
          <ellipse cx="37" cy="40" rx="4" ry="6" fill="white" />
          <circle cx="37" cy="41" r="3" fill="#1a1a1a">
            <animate
              attributeName="cy"
              values="41;42;41"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Right eye */}
        <g>
          <ellipse cx="63" cy="40" rx="4" ry="6" fill="white" />
          <circle cx="63" cy="41" r="3" fill="#1a1a1a">
            <animate
              attributeName="cy"
              values="41;42;41"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Eyebrows (varies by emotion) */}
        {emotion === 'anger' && (
          <>
            <path d="M32,32 L42,34" stroke="#1a1a1a" strokeWidth="2" fill="none" />
            <path d="M58,34 L68,32" stroke="#1a1a1a" strokeWidth="2" fill="none" />
          </>
        )}
        {emotion === 'surprise' && (
          <>
            <path d="M32,28 Q37,26 42,28" stroke="#1a1a1a" strokeWidth="2" fill="none" />
            <path d="M58,28 Q63,26 68,28" stroke="#1a1a1a" strokeWidth="2" fill="none" />
          </>
        )}
        {emotion === 'sadness' && (
          <>
            <path d="M32,34 Q37,32 42,34" stroke="#1a1a1a" strokeWidth="2" fill="none" />
            <path d="M58,34 Q63,32 68,34" stroke="#1a1a1a" strokeWidth="2" fill="none" />
          </>
        )}

        {/* Mouth */}
        <path
          d={config.mouthPath}
          stroke="#1a1a1a"
          strokeWidth="2.5"
          fill={emotion === 'surprise' ? '#1a1a1a' : 'none'}
          strokeLinecap="round"
        />

        {/* Blush (for joy and love) */}
        {(emotion === 'joy' || emotion === 'love') && (
          <>
            <circle cx="25" cy="55" r="6" fill="#ff6b9d" opacity="0.3" />
            <circle cx="75" cy="55" r="6" fill="#ff6b9d" opacity="0.3" />
          </>
        )}

        {/* Hearts (for love) */}
        {emotion === 'love' && (
          <>
            <path
              d="M20,20 L22,18 Q24,16 26,18 L28,20 Q26,22 22,24 Z"
              fill="#ff1493"
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -2,-4; 0,0"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M75,15 L77,13 Q79,11 81,13 L83,15 Q81,17 77,19 Z"
              fill="#ff1493"
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 2,-4; 0,0"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </path>
          </>
        )}

        {/* Sweat drop (for fear) */}
        {emotion === 'fear' && (
          <ellipse cx="72" cy="38" rx="2.5" ry="4" fill="#4fc3f7" opacity="0.7">
            <animate
              attributeName="cy"
              values="38;44;38"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </ellipse>
        )}
      </svg>

      {/* Emotion label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium capitalize whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ 
          color: config.color.split(' ')[2]?.replace('to-', '') || 
                 config.color.split(' ')[1]?.replace('from-', '') || 
                 '#9333ea' 
        }}
      >
        {emotion}
      </motion.div>
    </motion.div>
  );
}
