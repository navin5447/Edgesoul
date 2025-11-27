// Two Friends Chatting - Using Image
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ChatIllustrationProps {
  gender?: 'male' | 'female' | 'other' | 'not_set';
  theme: any;
}

export default function ChatIllustration({ gender = 'not_set', theme }: ChatIllustrationProps) {
  // Use different images based on gender
  const imageSrc = gender === 'female' 
    ? '/images/chat-illustration-female.png'
    : '/images/chat-illustration.png';
  
  return (
    <motion.div 
      className="w-full flex justify-center pointer-events-none"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative w-full h-64">
        <Image
          src={imageSrc}
          alt="Two friends chatting"
          fill
          className="object-cover rounded-t-[2rem]"
          priority
        />
      </div>
    </motion.div>
  );
}

