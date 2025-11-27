// Dashboard Page - Exact Reference Style Match
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  MessageSquare, History, LogOut, Settings, BarChart3,
  TrendingUp, Brain, Activity, Search
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ChatIllustration } from '@/components/illustrations';

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
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #A8CFFB 0%, #C4D7F7 50%, #D3C7F8 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full"
          style={{ borderColor: '#358BFF' }}
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <ReferenceDashboard 
        theme={theme}
        user={user}
        stats={stats}
        handleLogout={handleLogout}
        router={router}
        gender={gender}
      />
    </ProtectedRoute>
  );
}

// REFERENCE STYLE DASHBOARD - Exact Visual Match
function ReferenceDashboard({ theme, user, stats, handleLogout, router, gender }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #A8CFFB 0%, #C4D7F7 50%, #D3C7F8 100%)',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* Floating Light Particles - Soft Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(35)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 5 + 2 + 'px',
              height: Math.random() * 5 + 2 + 'px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
              boxShadow: '0 0 15px rgba(255,255,255,0.7)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Soft Gradient Orbs */}
      <div className="absolute top-20 right-10 w-[600px] h-[600px] rounded-full blur-3xl" 
        style={{ background: 'radial-gradient(circle, rgba(168, 207, 251, 0.35) 0%, rgba(168, 207, 251, 0) 70%)' }} />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-3xl" 
        style={{ background: 'radial-gradient(circle, rgba(211, 199, 248, 0.35) 0%, rgba(211, 199, 248, 0) 70%)' }} />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        
        {/* Navigation Bar - Frosted Glass */}
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="backdrop-blur-2xl rounded-3xl px-6 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 100%)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)'
            }}>
            <div className="flex items-center justify-between">
              
              {/* Logo with Glossy Blue Gradient */}
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
                    boxShadow: '0 4px 14px rgba(53, 139, 255, 0.35)'
                  }}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#1e293b' }}>EdgeSoul AI</span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                {['Dashboard', 'About Us', 'Resources', 'Contact'].map((item) => (
                  <button
                    key={item}
                    className="hover:opacity-70 transition-opacity font-medium text-sm"
                    style={{ color: '#475569' }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Actions - Search + Sign Up */}
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-white/30 rounded-lg transition-colors">
                  <Search className="w-5 h-5" style={{ color: '#475569' }} />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white px-6 py-2.5 rounded-xl hover:shadow-2xl transition-all font-semibold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
                    boxShadow: '0 4px 16px rgba(53, 139, 255, 0.45)'
                  }}
                >
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section - Frosted Glass Panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="backdrop-blur-2xl rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.35) 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.7)'
            }}>
            
            <div className="grid grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div className="space-y-6">
                <div>
                  <motion.p 
                    className="text-xs font-semibold mb-3 tracking-widest uppercase"
                    style={{ color: '#64748b', letterSpacing: '0.15em' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    Emotional Intelligence
                  </motion.p>
                  <motion.h1 
                    className="text-5xl font-bold leading-tight"
                    style={{ color: '#0f172a' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    Emotional Intelligence<br />Dashboard Dashboard
                  </motion.h1>
                </div>

                <motion.p 
                  className="text-base leading-relaxed"
                  style={{ color: '#64748b' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  Redesigned EdgeSoul AI emotional dashboard with a premium enterprise-grade aesthetic.
                </motion.p>

                <motion.button
                  onClick={() => router.push('/chat')}
                  className="inline-flex items-center space-x-2 text-white px-7 py-3.5 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
                    boxShadow: '0 6px 22px rgba(53, 139, 255, 0.45)'
                  }}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(53, 139, 255, 0.55)' }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                >
                  <span>Launch Interface</span>
                </motion.button>
              </div>

              {/* Right Illustration */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <ChatIllustration />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats & Analytics Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Stat Cards */}
          <div className="col-span-4 space-y-6">
            
            {/* Total Sessions Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-2xl rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>Total Sessions</p>
                  <p className="text-4xl font-bold" style={{ color: '#0f172a' }}>
                    {stats.conversations.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.1) 100%)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                  }}>
                  <Activity className="w-6 h-6" style={{ color: '#3b82f6' }} />
                </div>
              </div>
            </motion.div>

            {/* Emotions Analyzed Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-2xl rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>Emotions Analyzed</p>
                  <p className="text-4xl font-bold" style={{ color: '#0f172a' }}>
                    {(stats.emotionsDetected / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(192, 132, 252, 0.1) 100%)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }}>
                  <Brain className="w-6 h-6" style={{ color: '#a855f7' }} />
                </div>
              </div>
            </motion.div>

            {/* Days Active Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="backdrop-blur-2xl rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>Days Active</p>
                  <p className="text-4xl font-bold" style={{ color: '#0f172a' }}>
                    {stats.daysActive}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.2) 0%, rgba(252, 165, 165, 0.1) 100%)',
                    boxShadow: '0 0 20px rgba(251, 113, 133, 0.3)'
                  }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#f43f5e' }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Analytics Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-8 backdrop-blur-2xl rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.6)'
            }}
          >
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                Emotional Analytics Dashboard
              </h3>
              <div className="flex items-center space-x-4">
                <button className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors" 
                  style={{ color: '#64748b' }}>
                  Line Charts
                </button>
                <button className="text-sm font-semibold px-4 py-1.5 rounded-lg" 
                  style={{ 
                    color: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)'
                  }}>
                  Data Visualization
                </button>
              </div>
            </div>

            {/* Chart Area - Neon Glow Lines */}
            <div className="relative h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-medium" style={{ color: '#94a3b8' }}>
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              {/* Chart SVG */}
              <svg className="w-full h-full pl-8" viewBox="0 0 900 250" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)" />
                    <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                  </linearGradient>
                  <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Cyan Wave */}
                <path
                  d="M 0 120 Q 100 80, 200 100 T 400 110 T 600 90 T 800 100 T 900 80"
                  fill="url(#cyanGlow)"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  filter="url(#glow)"
                  opacity="0.9"
                />

                {/* Purple Wave */}
                <path
                  d="M 0 140 Q 100 100, 200 120 T 400 130 T 600 110 T 800 140 T 900 130"
                  fill="url(#purpleGlow)"
                  stroke="#a855f7"
                  strokeWidth="3"
                  filter="url(#glow)"
                  opacity="0.8"
                />
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between mt-3 text-xs font-medium" style={{ color: '#94a3b8' }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-6 mt-6"
        >
          {/* Profile Settings */}
          <button
            onClick={() => router.push('/profile')}
            className="backdrop-blur-2xl rounded-2xl p-6 hover:scale-105 transition-transform text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.6)'
            }}
          >
            <Settings className="w-8 h-8 mb-3" style={{ color: '#3b82f6' }} />
            <h4 className="font-semibold mb-1" style={{ color: '#0f172a' }}>Profile Settings</h4>
            <p className="text-sm" style={{ color: '#64748b' }}>Manage your preferences</p>
          </button>

          {/* Conversation History */}
          <button
            onClick={() => router.push('/history')}
            className="backdrop-blur-2xl rounded-2xl p-6 hover:scale-105 transition-transform text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.6)'
            }}
          >
            <History className="w-8 h-8 mb-3" style={{ color: '#a855f7' }} />
            <h4 className="font-semibold mb-1" style={{ color: '#0f172a' }}>Conversation History</h4>
            <p className="text-sm" style={{ color: '#64748b' }}>View past conversations</p>
          </button>

          {/* Analytics */}
          <button
            onClick={() => router.push('/analytics')}
            className="backdrop-blur-2xl rounded-2xl p-6 hover:scale-105 transition-transform text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.6)'
            }}
          >
            <BarChart3 className="w-8 h-8 mb-3" style={{ color: '#f43f5e' }} />
            <h4 className="font-semibold mb-1" style={{ color: '#0f172a' }}>Analytics</h4>
            <p className="text-sm" style={{ color: '#64748b' }}>Detailed insights</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
