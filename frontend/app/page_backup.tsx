// Landing Page - Futuristic Design with Neon Glow
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Brain, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const glowVariants = {
    initial: { opacity: 0.5, scale: 1 },
    animate: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center"
      >
        {/* Logo/Icon */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1">
            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-400" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 40px rgba(168, 85, 247, 0.4)'
          }}
        >
          EdgeSoul
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
        >
          Your AI companion that understands emotions, powered by local intelligence
        </motion.p>

        {/* Feature Icons */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-8 mb-16"
        >
          <FeatureIcon icon={Heart} label="Emotional" color="text-pink-400" />
          <FeatureIcon icon={Brain} label="Intelligent" color="text-purple-400" />
          <FeatureIcon icon={Shield} label="Private" color="text-emerald-400" />
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <button
            onClick={() => router.push('/local-auth')}
            className="group relative px-12 py-4 text-lg font-semibold text-white rounded-[18px] overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7F5AF0 0%, #2CB67D 50%, #FF8906 100%)',
              boxShadow: '0 0 40px rgba(127, 90, 240, 0.5)'
            }}
          >
            <span className="relative z-10">Get Started</span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8 mt-24"
        >
          <FeatureCard
            title="Emotion Detection"
            description="Advanced AI that understands your feelings and responds with empathy"
            gradient="from-purple-500/20 to-pink-500/20"
          />
          <FeatureCard
            title="Local AI Power"
            description="Runs entirely on your device with Ollama - your data stays private"
            gradient="from-pink-500/20 to-orange-500/20"
          />
          <FeatureCard
            title="Smart Conversations"
            description="Hybrid engine combining emotional intelligence with knowledge base"
            gradient="from-orange-500/20 to-purple-500/20"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureIcon({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -5 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="w-16 h-16 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center border border-gray-700/50">
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </motion.div>
  );
}

function FeatureCard({ title, description, gradient }: { title: string; description: string; gradient: string }) {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      whileHover={{ y: -5 }}
      className={`p-8 rounded-[18px] bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/10 transition-all duration-300`}
    >
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}
