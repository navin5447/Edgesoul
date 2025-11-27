// Gender-Specific Animated Avatar with Emotion-Based Expressions
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GenderAvatarProps {
  emotion?: string;
  gender?: 'male' | 'female' | 'other' | 'not_set';
  size?: number;
  className?: string;
}

// Emotion configurations with colors
const emotionConfig: Record<string, {
  color: string;
  mouthPath: string;
  eyeShape: string;
  animation: any;
  glow: string;
}> = {
  joy: {
    color: '#FFD93D',
    eyeShape: 'happy',
    mouthPath: 'M30,55 Q40,65 50,55',
    animation: { y: [0, -5, 0], rotate: [0, 5, -5, 0] },
    glow: 'drop-shadow(0 0 20px rgba(255, 217, 61, 0.6))'
  },
  sadness: {
    color: '#6BA3D5',
    eyeShape: 'sad',
    mouthPath: 'M30,60 Q40,55 50,60',
    animation: { y: [0, 2, 0] },
    glow: 'drop-shadow(0 0 20px rgba(107, 163, 213, 0.6))'
  },
  anger: {
    color: '#E74C3C',
    eyeShape: 'angry',
    mouthPath: 'M30,58 L50,58',
    animation: { x: [-2, 2, -2, 2, 0], scale: [1, 1.05, 1] },
    glow: 'drop-shadow(0 0 25px rgba(231, 76, 60, 0.7))'
  },
  fear: {
    color: '#9B59B6',
    eyeShape: 'scared',
    mouthPath: 'M35,58 Q40,62 45,58',
    animation: { x: [-1, 1, -1], y: [-1, 1, -1] },
    glow: 'drop-shadow(0 0 20px rgba(155, 89, 182, 0.6))'
  },
  surprise: {
    color: '#F39C12',
    eyeShape: 'surprised',
    mouthPath: 'M35,55 Q40,60 45,55 Q40,65 35,55 Z',
    animation: { scale: [1, 1.1, 1] },
    glow: 'drop-shadow(0 0 20px rgba(243, 156, 18, 0.6))'
  },
  love: {
    color: '#E91E63',
    eyeShape: 'love',
    mouthPath: 'M30,55 Q40,63 50,55',
    animation: { scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] },
    glow: 'drop-shadow(0 0 25px rgba(233, 30, 99, 0.8))'
  },
  neutral: {
    color: '#95A5A6',
    eyeShape: 'neutral',
    mouthPath: 'M35,58 L45,58',
    animation: { y: [0, -2, 0] },
    glow: 'drop-shadow(0 0 15px rgba(149, 165, 166, 0.5))'
  }
};

export default function GenderAvatar({ 
  emotion = 'neutral', 
  gender = 'not_set', 
  size = 120, 
  className = '' 
}: GenderAvatarProps) {
  const config = emotionConfig[emotion.toLowerCase()] || emotionConfig.neutral;
  const actualGender = gender === 'not_set' ? 'male' : gender;
  
  // Gender-specific styling
  const isMale = actualGender === 'male';
  const isFemale = actualGender === 'female';
  
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={{
        ...config.animation,
        transition: { duration: 2, repeat: Infinity }
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ background: config.color }}
      />

      {/* Main avatar SVG */}
      <svg
        viewBox="0 0 100 100"
        className="relative z-10"
        style={{ filter: config.glow }}
      >
        <defs>
          <linearGradient id={`skin-${gender}-${emotion}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isFemale ? (
              <>
                <stop offset="0%" stopColor="#FFD7C4" />
                <stop offset="100%" stopColor="#FFC4A8" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#F4C2A0" />
                <stop offset="100%" stopColor="#E6A87E" />
              </>
            )}
          </linearGradient>
          
          <linearGradient id={`hair-${gender}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {isFemale ? (
              <>
                <stop offset="0%" stopColor="#8B4513" />
                <stop offset="100%" stopColor="#6B3410" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#2C2416" />
                <stop offset="100%" stopColor="#1A1410" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* Head/Face */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill={`url(#skin-${gender}-${emotion})`}
        />

        {/* Hair */}
        {isFemale ? (
          <>
            {/* Female - Long hair */}
            <ellipse cx="50" cy="30" rx="38" ry="25" fill={`url(#hair-${gender})`} />
            {/* Side hair */}
            <ellipse cx="20" cy="50" rx="8" ry="20" fill={`url(#hair-${gender})`} />
            <ellipse cx="80" cy="50" rx="8" ry="20" fill={`url(#hair-${gender})`} />
            {/* Hair accessory */}
            <circle cx="70" cy="28" r="4" fill="#FF69B4" />
            <circle cx="30" cy="28" r="4" fill="#FF69B4" />
          </>
        ) : (
          <>
            {/* Male - Short hair */}
            <ellipse cx="50" cy="25" rx="36" ry="18" fill={`url(#hair-${gender})`} />
            {/* Side hair */}
            <path d="M15,40 Q15,25 25,22 L25,45 Z" fill={`url(#hair-${gender})`} />
            <path d="M85,40 Q85,25 75,22 L75,45 Z" fill={`url(#hair-${gender})`} />
          </>
        )}

        {/* Eyes based on emotion */}
        <g>
          {/* Left Eye */}
          {config.eyeShape === 'happy' && (
            <path d="M32,42 Q37,38 42,42" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {config.eyeShape === 'sad' && (
            <>
              <ellipse cx="37" cy="42" rx="4" ry="5" fill="white" />
              <circle cx="37" cy="43" r="3" fill="#1a1a1a" />
              <path d="M32,38 Q37,36 42,38" stroke="#1a1a1a" strokeWidth="2" fill="none" />
            </>
          )}
          {config.eyeShape === 'angry' && (
            <>
              <line x1="30" y1="40" x2="40" y2="43" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="37" cy="44" r="2.5" fill="#1a1a1a" />
            </>
          )}
          {config.eyeShape === 'scared' && (
            <>
              <circle cx="37" cy="42" r="5" fill="white" />
              <circle cx="37" cy="42" r="3" fill="#1a1a1a" />
            </>
          )}
          {config.eyeShape === 'surprised' && (
            <>
              <circle cx="37" cy="42" r="6" fill="white" />
              <circle cx="37" cy="42" r="4" fill="#1a1a1a" />
            </>
          )}
          {config.eyeShape === 'love' && (
            <path d="M32,38 L37,42 L42,38 Q40,35 37,37 Q34,35 32,38 Z" fill="#E91E63" />
          )}
          {config.eyeShape === 'neutral' && (
            <>
              <ellipse cx="37" cy="42" rx="4" ry="5" fill="white" />
              <circle cx="37" cy="43" r="3" fill="#1a1a1a" />
            </>
          )}

          {/* Right Eye (mirror of left) */}
          {config.eyeShape === 'happy' && (
            <path d="M58,42 Q63,38 68,42" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {config.eyeShape === 'sad' && (
            <>
              <ellipse cx="63" cy="42" rx="4" ry="5" fill="white" />
              <circle cx="63" cy="43" r="3" fill="#1a1a1a" />
              <path d="M58,38 Q63,36 68,38" stroke="#1a1a1a" strokeWidth="2" fill="none" />
            </>
          )}
          {config.eyeShape === 'angry' && (
            <>
              <line x1="60" y1="43" x2="70" y2="40" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="63" cy="44" r="2.5" fill="#1a1a1a" />
            </>
          )}
          {config.eyeShape === 'scared' && (
            <>
              <circle cx="63" cy="42" r="5" fill="white" />
              <circle cx="63" cy="42" r="3" fill="#1a1a1a" />
            </>
          )}
          {config.eyeShape === 'surprised' && (
            <>
              <circle cx="63" cy="42" r="6" fill="white" />
              <circle cx="63" cy="42" r="4" fill="#1a1a1a" />
            </>
          )}
          {config.eyeShape === 'love' && (
            <path d="M58,38 L63,42 L68,38 Q66,35 63,37 Q60,35 58,38 Z" fill="#E91E63" />
          )}
          {config.eyeShape === 'neutral' && (
            <>
              <ellipse cx="63" cy="42" rx="4" ry="5" fill="white" />
              <circle cx="63" cy="43" r="3" fill="#1a1a1a" />
            </>
          )}
        </g>

        {/* Nose */}
        <ellipse cx="50" cy="52" rx="3" ry="4" fill="rgba(0,0,0,0.1)" />

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
            <circle cx="25" cy="55" r="6" fill="#FF9AA2" opacity="0.4" />
            <circle cx="75" cy="55" r="6" fill="#FF9AA2" opacity="0.4" />
          </>
        )}

        {/* Gender-specific accessories */}
        {isFemale && emotion === 'love' && (
          <>
            <path d="M15,20 L17,18 Q19,16 21,18 L23,20 Q21,22 17,24 Z" fill="#FF1493" opacity="0.7">
              <animateTransform attributeName="transform" type="translate" values="0,0; -2,-4; 0,0" dur="2s" repeatCount="indefinite" />
            </path>
          </>
        )}

        {/* Sweat drop for fear */}
        {emotion === 'fear' && (
          <ellipse cx="72" cy="40" rx="2.5" ry="4" fill="#4fc3f7" opacity="0.7">
            <animate attributeName="cy" values="40;46;40" dur="1.5s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* Tears for sadness */}
        {emotion === 'sadness' && (
          <>
            <ellipse cx="33" cy="48" rx="2" ry="3" fill="#4fc3f7" opacity="0.6">
              <animate attributeName="cy" values="48;56;48" dur="2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="67" cy="48" rx="2" ry="3" fill="#4fc3f7" opacity="0.6">
              <animate attributeName="cy" values="48;56;48" dur="2s" repeatCount="indefinite" />
            </ellipse>
          </>
        )}
      </svg>

      {/* Emotion label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold capitalize whitespace-nowrap px-2 py-1 rounded-full"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ 
          color: config.color,
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`
        }}
      >
        {emotion}
      </motion.div>
    </motion.div>
  );
}
