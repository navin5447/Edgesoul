// Dashboard Page - User Portal
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { MessageSquare, History, LogOut, Sparkles, User, Settings, BarChart3 } from 'lucide-react';
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
      className="min-h-screen overflow-hidden"
      style={{ 
        background: theme.gradient,
        fontFamily: theme.fontFamily 
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            backgroundColor: `${theme.primary}33`,
            boxShadow: gender === 'female' ? `0 0 100px ${theme.primary}50` : 'none'
          }}
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            backgroundColor: `${theme.secondary}33`,
            boxShadow: gender === 'female' ? `0 0 100px ${theme.secondary}50` : 'none'
          }}
        />
        {/* Extra sparkle for female theme */}
        {gender === 'female' && (
          <>
            <motion.div
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 7, repeat: Infinity, delay: 2 }}
              className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl"
              style={{ backgroundColor: `${theme.accent}30` }}
            />
            <motion.div
              animate={{
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 3 }}
              className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full blur-3xl"
              style={{ backgroundColor: `${theme.primaryLight}40` }}
            />
          </>
        )}
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
              <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">EdgeSoul</h1>
              <p className="text-gray-400 text-sm">AI Companion Dashboard</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-[18px] bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* User Greeting */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl rounded-[18px] p-8 border"
            style={{
              backgroundColor: `${theme.primary}15`,
              borderColor: `${theme.primary}30`,
              boxShadow: `0 0 40px ${theme.primary}20`
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                }}
              >
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-gray-300">Ready to continue your emotional AI journey?</p>
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
      whileHover={{ scale: 1.02, y: -5 }}
      className="backdrop-blur-xl rounded-[18px] p-6 border-2 cursor-pointer"
      style={{
        backgroundColor: `rgba(255, 255, 255, 0.08)`,
        borderColor: `${bgColor}`,
        boxShadow: `0 4px 20px ${bgColor}50`
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: `${bgColor}`,
            border: `2px solid rgba(255, 255, 255, 0.2)`
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-gray-300 text-sm">{description}</p>
        </div>
      </div>
      <button
        className="w-full py-2 rounded-[18px] text-white font-medium transition-all duration-300"
        style={{
          backgroundColor: `rgba(255, 255, 255, 0.1)`,
          border: `2px solid ${bgColor}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${bgColor}80`;
          e.currentTarget.style.borderColor = `${bgColor}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, 0.1)`;
          e.currentTarget.style.borderColor = `${bgColor}`;
        }}
      >
        {buttonText}
      </button>
    </motion.div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div 
      className="backdrop-blur-xl rounded-[18px] p-6 border-2 text-center"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: color,
        boxShadow: `0 4px 20px ${color}50`
      }}
    >
      <p 
        className="text-3xl font-bold mb-1"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-gray-300 text-sm">{title}</p>
    </div>
  );
}
