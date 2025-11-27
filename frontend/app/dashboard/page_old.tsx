// Dashboard Page - Premium Gender-Specific Designs
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  MessageSquare, History, LogOut, Sparkles, User, Settings, BarChart3,
  Zap, TrendingUp, Heart, Brain, Star, Activity
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useLocalAuth();
  const { theme, gender } = useTheme();
  const [stats, setStats] = React.useState({
    conversations: 0,
    emotionsDetected: 0,
    daysActive: 1
  });

  // Fetch user stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem('edgesoul_user_id') || 'user_001';
        const response = await fetch(`http://localhost:8000/api/v1/memory/stats/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            conversations: data.profile?.total_conversations || data.conversation?.message_count || 0,
            emotionsDetected: data.emotions?.total_occurrences || data.emotions?.patterns_tracked || 0,
            daysActive: data.profile?.days_active || Math.max(1, Math.floor((Date.now() - new Date(data.profile?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user) {
      fetchStats();
      // Refresh stats every 10 seconds
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/local-auth');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <ProtectedRoute>
    <div 
      className="min-h-screen overflow-hidden transition-colors duration-300"
      style={{ 
        background: theme.gradient,
        fontFamily: theme.fontFamily 
      }}
    >
      {/* Animated Background - Subtle gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            backgroundColor: `${theme.primary}20`,
          }}
        />
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            backgroundColor: `${theme.secondary}20`,
          }}
        />
        {/* Extra accent blobs for depth */}
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 4 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.accent}15` }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight})`,
              }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 
                className="text-4xl font-bold tracking-tight"
                style={{ color: theme.primary }}
              >
                EdgeSoul
              </h1>
              <p className="text-sm" style={{ color: `${theme.primary}99` }}>
                Your Emotional AI Companion
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-lg"
            style={{
              borderColor: '#EF4444',
              color: '#DC2626'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
              e.currentTarget.style.borderColor = '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.borderColor = '#EF4444';
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* User Greeting - Glassmorphism card */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl rounded-2xl p-8 border-2 shadow-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: `${theme.primary}40`,
              boxShadow: `0 8px 32px ${theme.primary}15`
            }}
          >
            <div className="flex items-center gap-5 mb-3">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                }}
              >
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 
                  className="text-3xl font-bold mb-1"
                  style={{ color: theme.primary }}
                >
                  Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-base" style={{ color: `${theme.primary}B3` }}>
                  Ready to continue your emotional AI journey?
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            <ActionCard
              icon={MessageSquare}
              title="Start Chatting"
              description="Have a conversation with EdgeSoul AI"
              bgColor={theme.primary}
              onClick={() => router.push('/chat')}
              buttonText="Open Chat"
              variants={itemVariants}
            />
            <ActionCard
              icon={Settings}
              title="Profile Settings"
              description="Customize your AI personality preferences"
              bgColor={theme.secondary}
              onClick={() => router.push('/profile')}
              buttonText="View Profile"
              variants={itemVariants}
            />
            <ActionCard
              icon={History}
              title="Chat History"
              description="View your past conversations and emotions"
              bgColor={theme.accent}
              onClick={() => router.push('/history')}
              buttonText="View History"
              variants={itemVariants}
            />
            <ActionCard
              icon={BarChart3}
              title="Analytics"
              description="Track your emotional patterns and insights"
              bgColor={theme.emotions.joy}
              onClick={() => router.push('/analytics')}
              buttonText="View Analytics"
              variants={itemVariants}
            />
          </div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4"
          >
            <StatCard title="Conversations" value={stats.conversations.toString()} color={theme.primary} />
            <StatCard title="Emotions Detected" value={stats.emotionsDetected.toString()} color={theme.secondary} />
            <StatCard title="Days Active" value={stats.daysActive.toString()} color={theme.accent} />
          </motion.div>
        </motion.div>
      </div>

      {/* 3D Avatar functionality removed for better stability */}
    </div>
    </ProtectedRoute>
  );
}

function ActionCard({ 
  icon: Icon, 
  title, 
  description, 
  bgColor, 
  onClick, 
  buttonText,
  variants 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  bgColor: string; 
  onClick: () => void; 
  buttonText: string;
  variants: any;
}) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.02, y: -8 }}
      className="backdrop-blur-xl rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: `${bgColor}60`,
        boxShadow: `0 4px 20px ${bgColor}20`
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        e.currentTarget.style.borderColor = bgColor;
        e.currentTarget.style.boxShadow = `0 8px 32px ${bgColor}35`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        e.currentTarget.style.borderColor = `${bgColor}60`;
        e.currentTarget.style.boxShadow = `0 4px 20px ${bgColor}20`;
      }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
          style={{ 
            backgroundColor: bgColor,
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1.5" style={{ color: bgColor }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: `${bgColor}CC` }}>
            {description}
          </p>
        </div>
      </div>
      <button
        className="w-full py-3 rounded-xl text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg"
        style={{
          backgroundColor: bgColor,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${bgColor}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${bgColor}30`;
        }}
      >
        {buttonText}
      </button>
    </motion.div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div 
      className="backdrop-blur-xl rounded-2xl p-6 border-2 text-center transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.65)',
        borderColor: isHovered ? `${color}90` : `${color}50`,
        boxShadow: isHovered ? `0 8px 32px ${color}30` : `0 4px 20px ${color}20`,
        transform: isHovered ? 'scale(1.03) translateY(-6px)' : 'scale(1) translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p 
        className="text-4xl font-bold mb-2"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-sm font-medium" style={{ color: `${color}B3` }}>{title}</p>
    </div>
  );
}
