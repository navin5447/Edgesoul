// Landing Page - Purple Neon Futuristic Design
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Brain, Shield, Sparkles, Zap, Lock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #5A1E78 0%, #3B0A59 50%, #150B38 100%)',
      fontFamily: "'Poppins', 'Inter', sans-serif"
    }}>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
      }} />

      {/* Animated Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              background: i % 3 === 0 ? '#FF6EE7' : i % 3 === 1 ? '#68E1FD' : '#9D7CFF',
              boxShadow: `0 0 ${Math.random() * 20 + 10}px currentColor`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Geometric Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 border-2 border-[#FF6EE7] rounded-lg"
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 border-2 border-[#68E1FD]"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-[#9D7CFF] rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Center Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, #9D7CFF 0%, transparent 70%)' }} />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        
        {/* Logo with Spotlight Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 relative"
        >
          {/* Logo Spotlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(157, 124, 255, 0.4) 0%, transparent 70%)' }} />
          
          <motion.div 
            className="inline-flex items-center justify-center w-28 h-28 rounded-full relative mb-6"
            animate={{
              boxShadow: [
                '0 0 40px rgba(255, 110, 231, 0.6)',
                '0 0 60px rgba(104, 225, 253, 0.6)',
                '0 0 40px rgba(157, 124, 255, 0.6)',
                '0 0 60px rgba(255, 110, 231, 0.6)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              background: 'linear-gradient(135deg, #FF6EE7 0%, #9D7CFF 50%, #68E1FD 100%)',
            }}
          >
            <div className="absolute inset-1 bg-[#150B38] rounded-full flex items-center justify-center">
              <Sparkles className="w-14 h-14 text-[#FF6EE7]" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-8xl font-black mb-6"
            style={{
              background: 'linear-gradient(135deg, #FF6EE7 0%, #9D7CFF 50%, #68E1FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px rgba(157, 124, 255, 0.8)',
              letterSpacing: '-0.02em'
            }}
          >
            EdgeSoul
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl text-white/80 max-w-2xl mx-auto font-light"
            style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}
          >
            Your AI companion that understands emotions, powered by local intelligence
          </motion.p>
        </motion.div>

        {/* Feature Icons with Neon Glow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex justify-center gap-12 mb-16"
        >
          <NeonFeatureIcon icon={Heart} label="Emotional" color="#FF6EE7" />
          <NeonFeatureIcon icon={Brain} label="Intelligent" color="#9D7CFF" />
          <NeonFeatureIcon icon={Shield} label="Private" color="#68E1FD" />
        </motion.div>

        {/* CTA Button with Gradient Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-center mb-24"
        >
          <motion.button
            onClick={() => router.push('/local-auth')}
            className="relative px-16 py-5 text-xl font-bold text-white rounded-2xl overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #9D7CFF 0%, #FF6EE7 100%)',
              boxShadow: '0 8px 32px rgba(157, 124, 255, 0.5), 0 0 60px rgba(255, 110, 231, 0.4)',
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 12px 40px rgba(157, 124, 255, 0.7), 0 0 80px rgba(255, 110, 231, 0.6)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <span>Get Started</span>
              <Zap className="w-6 h-6" />
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-4 text-sm text-white/60 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            100% Offline • Your data stays private
          </motion.p>
        </motion.div>

        {/* Feature Cards with Depth */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <NeonFeatureCard
            title="Emotion Detection"
            description="Advanced AI that understands your feelings and responds with genuine empathy"
            icon={Heart}
            glowColor="#FF6EE7"
          />
          <NeonFeatureCard
            title="Local AI Power"
            description="Runs entirely on your device with Ollama - your data never leaves your computer"
            icon={Brain}
            glowColor="#9D7CFF"
          />
          <NeonFeatureCard
            title="Smart Conversations"
            description="Hybrid engine combining emotional intelligence with comprehensive knowledge"
            icon={Shield}
            glowColor="#68E1FD"
          />
        </motion.div>
      </div>
    </div>
  );
}

function NeonFeatureIcon({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -8 }}
      className="flex flex-col items-center gap-3"
    >
      <motion.div
        className="w-24 h-24 rounded-full flex items-center justify-center relative backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          border: `2px solid ${color}40`,
          boxShadow: `0 0 40px ${color}60, inset 0 0 20px ${color}20`,
        }}
        animate={{
          boxShadow: [
            `0 0 40px ${color}60, inset 0 0 20px ${color}20`,
            `0 0 60px ${color}80, inset 0 0 30px ${color}30`,
            `0 0 40px ${color}60, inset 0 0 20px ${color}20`,
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon className="w-12 h-12" style={{ color }} />
      </motion.div>
      <span className="text-white/80 font-medium">{label}</span>
    </motion.div>
  );
}

function NeonFeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  glowColor 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  glowColor: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative p-8 rounded-3xl backdrop-blur-xl group"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Neon glow on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `0 0 40px ${glowColor}40, inset 0 0 20px ${glowColor}20`,
          border: `1px solid ${glowColor}60`
        }} />
      
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: `linear-gradient(135deg, ${glowColor}30, ${glowColor}10)`,
            boxShadow: `0 0 30px ${glowColor}40`
          }}>
          <Icon className="w-8 h-8" style={{ color: glowColor }} />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
