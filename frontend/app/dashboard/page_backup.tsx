// Dashboard Page - Premium Enterprise Grade Design
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  MessageSquare, History, LogOut, Settings, BarChart3,
  TrendingUp, Brain, Activity, Zap
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full border-white"
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <EnterpriseDashboard 
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

// ENTERPRISE DASHBOARD - Premium Glassmorphism Design
function EnterpriseDashboard({ theme, user, stats, handleLogout, router, gender }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Floating Particles Background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="absolute w-2 h-2 rounded-full bg-white"
          style={{
            left: `${5 + (i * 4.5)}%`,
            top: `${10 + (i * 3.5)}%`,
          }}
        />
      ))}

      {/* Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-4">
            {/* Logo with Glassmorphism */}
            <div className="relative">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)'
                }}
              >
                <Brain className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                EdgeSoul <span className="text-lg font-normal text-white/80">AI</span>
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-xl border border-white/30 hover:bg-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </button>
        </motion.div>

        {/* Hero Section with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 p-12 rounded-3xl backdrop-blur-xl border border-white/20 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-semibold text-white/70 mb-2 tracking-wider uppercase">Emotional Intelligence</p>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Emotional Intelligence<br/>Dashboard Dashboard
              </h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                Redesigned EdgeSoul AI emotional dashboard with a premium enterprise-grade aesthetic.
              </p>
              <button 
                onClick={() => router.push('/chat')}
                className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
              >
                Launch Interface
              </button>
            </div>
            <div className="flex justify-center">
              <ChatIllustration gender={gender} theme={theme} />
            </div>
          </div>
        </motion.div>

        {/* Stats and Analytics Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Stats Cards Column */}
          <div className="col-span-4 space-y-6">
            <PremiumStatCard
              icon={Activity}
              label="Total Sessions"
              value={stats.conversations.toLocaleString()}
              color="#4facfe"
            />
            <PremiumStatCard
              icon={Brain}
              label="Emotions Analyzed"
              value={stats.emotionsDetected.toLocaleString()}
              color="#a18cd1"
            />
            <PremiumStatCard
              icon={TrendingUp}
              label="Days Active"
              value={stats.daysActive}
              color="#fbc2eb"
            />
          </div>

          {/* Analytics Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8 p-8 rounded-3xl backdrop-blur-xl border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Emotional Analytics Dashboard</h3>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-all">
                  Line Charts
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/20 backdrop-blur transition-all">
                  Data Visualization
                </button>
              </div>
            </div>
            
            {/* Simulated Chart Area */}
            <div className="relative h-64 flex items-end justify-around gap-2 px-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, i) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${40 + Math.sin(i) * 30 + Math.random() * 30}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full rounded-t-lg relative overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, 
                        rgba(79, 172, 254, 0.8) 0%, 
                        rgba(0, 242, 254, 0.4) 100%)`,
                      boxShadow: '0 -4px 16px rgba(79, 172, 254, 0.3)'
                    }}
                  />
                  <span className="text-xs text-white/60">{month}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <ActionCard
            icon={Settings}
            title="Profile Settings"
            onClick={() => router.push('/profile')}
          />
          <ActionCard
            icon={History}
            title="Conversation History"
            onClick={() => router.push('/history')}
          />
          <ActionCard
            icon={BarChart3}
            title="Analytics"
            onClick={() => router.push('/analytics')}
          />
        </div>
      </div>
    </div>
  );
}

// Premium Stat Card Component
function PremiumStatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="p-6 rounded-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur"
          style={{ 
            background: `linear-gradient(135deg, ${color}40, ${color}20)`,
            boxShadow: `0 4px 16px ${color}30`
          }}
        >
          <Icon className="w-7 h-7 text-white drop-shadow-lg" />
        </div>
        <div>
          <div className="text-3xl font-bold text-white drop-shadow-lg">{value}</div>
          <div className="text-sm text-white/70 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Action Card Component
function ActionCard({ icon: Icon, title, onClick }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -6 }}
      onClick={onClick}
      className="p-6 rounded-2xl backdrop-blur-xl border border-white/20 cursor-pointer relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Icon className="w-6 h-6 text-white drop-shadow" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
    </motion.div>
  );
}

// MALE DASHBOARD - Professional, Tech-Forward Design
function MaleDashboard({ theme, user, stats, handleLogout, router, gender }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: theme.gradient,
      fontFamily: theme.fontFamily 
    }}>
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.primary} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Geometric Floating Elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute"
          style={{
            width: `${60 + i * 20}px`,
            height: `${60 + i * 20}px`,
            left: `${i * 12}%`,
            top: `${10 + i * 8}%`,
            background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}15)`,
            borderRadius: i % 2 === 0 ? '30%' : '50%',
            border: `2px solid ${theme.primary}25`,
            boxShadow: `0 0 40px ${theme.primary}15`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-16"
        >
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              {/* Rotating Border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl opacity-30 blur-xl"
                style={{ background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.accent}, ${theme.primaryDark}, ${theme.primary})` }}
              />
              {/* Inner Glow */}
              <div 
                className="absolute inset-0 rounded-2xl blur-md opacity-40"
                style={{ background: `radial-gradient(circle, ${theme.primary}60, transparent)` }}
              />
              {/* Main Icon */}
              <div 
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
                  boxShadow: `0 8px 32px ${theme.primary}40, inset 0 1px 0 rgba(255,255,255,0.2)`
                }}
              >
                <Shield className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3" style={{ color: theme.primary }}>
                EdgeSoul <span className="text-xl opacity-60">AI</span>
              </h1>
              <p className="text-sm mt-1 font-medium" style={{ color: `${theme.primary}90` }}>
                Advanced Emotional Intelligence System
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderColor: '#DC2626',
              color: '#DC2626'
            }}
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </button>
        </motion.div>

        {/* Stats Banner - Horizontal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <StatCardMale icon={Activity} label="Total Sessions" value={stats.conversations} theme={theme} />
          <StatCardMale icon={Brain} label="Emotions Analyzed" value={stats.emotionsDetected} theme={theme} />
          <StatCardMale icon={TrendingUp} label="Days Active" value={stats.daysActive} theme={theme} />
        </motion.div>

        {/* Main Grid - Asymmetric Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Large Feature Card - Reduced Height */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-7"
            style={{ maxHeight: '400px' }}
          >
            <FeatureCardMale
              icon={MessageSquare}
              title="AI Chat Interface"
              description="Engage in emotionally-aware conversations with advanced natural language processing"
              onClick={() => router.push('/chat')}
              theme={theme}
              featured
              showIllustration={true}
              gender={gender}
            />
          </motion.div>

          {/* Sidebar Cards - Reduced spacing */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-5 space-y-4"
          >
            <div style={{ height: '190px' }}>
              <FeatureCardMale
                icon={Settings}
                title="Profile Settings"
                description="Manage your personal settings"
                onClick={() => router.push('/profile')}
                theme={theme}
                showIllustration={false}
                gender={gender}
                cardType="profile"
              />
            </div>
            <SmallCardMale
              icon={History}
              title="Conversation History"
              onClick={() => router.push('/history')}
              theme={theme}
            />
          </motion.div>
        </div>

        {/* Bottom Analytics Card - Separate from grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <AnalyticsCardMale onClick={() => router.push('/analytics')} theme={theme} />
        </motion.div>
      </div>
    </div>
  );
}

// FEMALE DASHBOARD - Soft Pastel Feminine Aesthetic
function FemaleDashboard({ theme, user, stats, handleLogout, router, gender }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #FFE5F0 0%, #F3E5FF 25%, #E5EDFF 50%, #E0F2FE 75%, #FCE7F3 100%)',
      fontFamily: "'Poppins', 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Soft Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" 
                fill="url(#sparkle-gradient)" opacity="0.6"/>
              <defs>
                <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F9A8D4" />
                  <stop offset="50%" stopColor="#DDD6FE" />
                  <stop offset="100%" stopColor="#BAE6FD" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Soft Pastel Gradient Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          animate={{
            y: [0, -50, 0],
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeInOut"
          }}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${250 + i * 40}px`,
            height: `${250 + i * 40}px`,
            left: `${i * 18}%`,
            top: `${10 + i * 15}%`,
            background: i % 3 === 0 
              ? 'radial-gradient(circle at 30% 30%, rgba(249, 168, 212, 0.35) 0%, rgba(249, 168, 212, 0.1) 50%, transparent 70%)'
              : i % 3 === 1
                ? 'radial-gradient(circle at 70% 70%, rgba(221, 214, 254, 0.35) 0%, rgba(221, 214, 254, 0.1) 50%, transparent 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(186, 230, 253, 0.3) 0%, rgba(186, 230, 253, 0.1) 50%, transparent 70%)',
          }}
        />
      ))}

      {/* Gentle Floating Hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          animate={{
            y: [0, -40, 0],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeInOut"
          }}
          className="absolute"
          style={{
            left: `${8 + (i * 12)}%`,
            top: `${10 + (i * 10)}%`,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
              fill="#F9A8D4" opacity="0.4"/>
          </svg>
        </motion.div>
      ))}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Soft Feminine Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                  fill="url(#heart-gradient)"/>
                <defs>
                  <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9A8D4" />
                    <stop offset="100%" stopColor="#DDD6FE" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <h1 className="text-5xl font-bold" style={{ 
              background: 'linear-gradient(135deg, #D873A6 0%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              EdgeSoul
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" 
                  fill="url(#sparkle-gradient-2)"/>
                <defs>
                  <linearGradient id="sparkle-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBD5E5" />
                    <stop offset="50%" stopColor="#C4B5FD" />
                    <stop offset="100%" stopColor="#BAE6FD" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
          <p className="text-lg mb-8" style={{ color: '#7A6BA8', fontWeight: 500 }}>
            Welcome back, {user?.displayName || 'Beautiful Soul'} ✨
          </p>

          <button
            onClick={handleLogout}
            className="px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #FBD5E5 0%, #E9D5FF 100%)',
              border: '2px solid rgba(249, 168, 212, 0.4)',
              color: '#A855F7',
              boxShadow: '0 4px 20px rgba(249, 168, 212, 0.3)'
            }}
          >
            Sign Out
          </button>
        </motion.div>

        {/* Circular Stats */}
        <div className="flex justify-center gap-8 mb-12">
          <CircularStat value={stats.conversations} label="Chats" theme={theme} />
          <CircularStat value={stats.emotionsDetected} label="Emotions" theme={theme} />
          <CircularStat value={stats.daysActive} label="Days" theme={theme} />
        </div>

        {/* Organic Card Grid */}
        <div className="grid grid-cols-2 gap-8">
          <ElegantCard
            icon={MessageSquare}
            title="Start Chatting"
            description="Share your thoughts and feelings"
            onClick={() => router.push('/chat')}
            theme={theme}
            gradient
            showIllustration={true}
            gender={gender}
          />
          <ElegantCard
            icon={Settings}
            title="Profile"
            description="Personalize your experience"
            onClick={() => router.push('/profile')}
            theme={theme}
            showIllustration={false}
            gender={gender}
            cardType="profile"
          />
          <ElegantCard
            icon={History}
            title="Memories"
            description="Revisit past conversations"
            onClick={() => router.push('/history')}
            theme={theme}
          />
          <ElegantCard
            icon={BarChart3}
            title="Insights"
            description="Discover emotional patterns"
            onClick={() => router.push('/analytics')}
            theme={theme}
            gradient
          />
        </div>
      </div>
    </div>
  );
}

// OTHER DASHBOARD - Balanced, Minimalist
function OtherDashboard({ theme, user, stats, handleLogout, router, gender }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: `linear-gradient(135deg, 
        #F3E8FF 0%, 
        #E0E7FF 20%, 
        #DBEAFE 40%, 
        #D1FAE5 60%, 
        #FEF3C7 80%, 
        #FED7AA 100%)`,
      fontFamily: theme.fontFamily 
    }}>
      {/* Layered Background Effects */}
      <div className="absolute inset-0">
        {/* Base Gradient Layer */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `radial-gradient(circle at 30% 20%, ${theme.primary}12 0%, transparent 50%),
                         radial-gradient(circle at 70% 80%, ${theme.accent}10 0%, transparent 50%)`
          }}
        />
        
        {/* Geometric Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${theme.primary}50 1px, transparent 1px),
                             linear-gradient(90deg, ${theme.primary}50 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        
        {/* Floating Ambient Elements */}
        <motion.div
          animate={{
            opacity: [0.08, 0.18, 0.08],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${theme.primary}18, transparent 70%)` }}
        />
        <motion.div
          animate={{
            opacity: [0.06, 0.15, 0.06],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 13, repeat: Infinity, delay: 3 }}
          className="absolute bottom-20 right-1/4 w-[450px] h-[450px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${theme.accent}15, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-16">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-bold mb-2" 
              style={{ 
                color: theme.primary,
                textShadow: `0 2px 20px ${theme.primary}25`
              }}
            >
              EdgeSoul
            </motion.h1>
            <p style={{ 
              color: `${theme.primary}B3`,
              textShadow: `0 1px 4px ${theme.primary}10`
            }}>
              Your Emotional Companion
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout} 
            className="px-6 py-3 rounded-xl backdrop-blur-xl" 
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              color: theme.primary,
              border: `2px solid ${theme.primary}50`,
              boxShadow: `0 4px 20px ${theme.primary}15, inset 0 1px 0 rgba(255,255,255,0.6)`
            }}
          >
            Logout
          </motion.button>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Conversations', value: stats.conversations },
            { label: 'Emotions', value: stats.emotionsDetected },
            { label: 'Days Active', value: stats.daysActive }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="relative text-center p-8 rounded-3xl backdrop-blur-xl overflow-hidden group" 
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.75) 100%)',
                border: `2px solid ${theme.primary}40`,
                boxShadow: `0 6px 28px ${theme.primary}12, inset 0 2px 0 rgba(255,255,255,0.5)`
              }}
            >
              {/* Hover Glow Effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                style={{ background: `linear-gradient(135deg, ${theme.primary}20, ${theme.accent}15)` }}
              />
              
              <div className="relative">
                <div 
                  className="text-5xl font-bold mb-2" 
                  style={{ 
                    color: theme.primary,
                    textShadow: `0 2px 15px ${theme.primary}25`
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ 
                  color: `${theme.primary}B3`,
                  textShadow: `0 1px 4px ${theme.primary}10`
                }}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Actions Grid */}
        <div className="grid grid-cols-2 gap-8">
          {[
            { icon: MessageSquare, title: 'Chat', path: '/chat' },
            { icon: Settings, title: 'Settings', path: '/profile' },
            { icon: History, title: 'History', path: '/history' },
            { icon: BarChart3, title: 'Analytics', path: '/analytics' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.path)}
              className="relative p-8 rounded-3xl cursor-pointer backdrop-blur-xl overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                border: `2px solid ${theme.primary}50`,
                boxShadow: `0 8px 32px ${theme.primary}15, inset 0 2px 0 rgba(255,255,255,0.6)`
              }}
            >
              {/* Animated Gradient Overlay */}
              <motion.div 
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute inset-0 opacity-0 group-hover:opacity-15"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                  backgroundSize: '200% 200%',
                }}
              />
              
              <div className="relative">
                {/* Chat Illustration for first card */}
                {i === 0 && <ChatIllustration gender={gender} theme={theme} />}
                {/* Icon with Glow */}
                <div className="relative w-12 h-12 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl blur-md"
                    style={{ background: `linear-gradient(135deg, ${theme.primary}40, ${theme.accent}30)` }}
                  />
                  <item.icon 
                    className="relative w-12 h-12" 
                    style={{ 
                      color: theme.primary,
                      filter: `drop-shadow(0 2px 8px ${theme.primary}25)`
                    }} 
                  />
                </div>
                
                <h3 
                  className="text-2xl font-bold" 
                  style={{ 
                    color: theme.primary,
                    textShadow: `0 2px 10px ${theme.primary}15`
                  }}
                >
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component Styles for Male Dashboard
function StatCardMale({ icon: Icon, label, value, theme }: any) {
  return (
    <div className="relative group">
      {/* Animated Glow Effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
        style={{ background: `linear-gradient(135deg, ${theme.primary}40, ${theme.accent}35)` }}
      />
      {/* Card */}
      <div 
        className="relative p-5 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          borderColor: `${theme.primary}40`,
          boxShadow: `0 4px 20px ${theme.primary}15, inset 0 1px 0 rgba(255,255,255,0.5)`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary}20, ${theme.accent}15)`,
              boxShadow: `0 2px 10px ${theme.primary}20`
            }}
          >
            <Icon className="w-6 h-6" style={{ color: theme.primary }} />
          </div>
          <div className="text-3xl font-bold" style={{ 
            color: theme.primary,
            textShadow: `0 2px 10px ${theme.primary}20`
          }}>{value}</div>
        </div>
        <div className="text-sm font-medium" style={{ color: `${theme.primary}90` }}>{label}</div>
      </div>
    </div>
  );
}

function FeatureCardMale({ icon: Icon, title, description, onClick, theme, featured, showIllustration, gender, cardType = 'chat' }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="relative h-full cursor-pointer overflow-hidden group"
    >
      {/* Animated Gradient Background */}
      <motion.div 
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent}, ${theme.primaryDark})`,
          backgroundSize: '200% 200%',
        }}
      />
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")',
        }}
      />
      {/* Card Surface */}
      <div className="relative h-full p-8 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        borderColor: `${theme.primary}60`,
        boxShadow: `0 8px 32px ${theme.primary}20, inset 0 2px 0 rgba(255,255,255,0.8)`
      }}>
        {showIllustration ? (
          <div className="flex flex-col h-full">
            {cardType === 'profile' ? (
              <>
                <div className="relative overflow-hidden" style={{ height: '100px' }}>
                  <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', marginTop: '-20px' }}>
                    <ProfileIllustration gender={gender} theme={theme} />
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full py-3 rounded-2xl font-semibold text-white transition-all" style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
                    boxShadow: `0 4px 16px ${theme.primary}40`
                  }}>
                    Profile Page →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1" style={{ maxHeight: '260px' }}>
                  <ChatIllustration gender={gender} theme={theme} />
                </div>
                <div className="p-4">
                  <button className="w-full py-3 rounded-2xl font-semibold text-white transition-all" style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
                    boxShadow: `0 4px 16px ${theme.primary}40`
                  }}>
                    Launch Interface →
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
            {/* Icon with Depth */}
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-2xl blur-lg opacity-60"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` }}
              />
              <div 
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
                  boxShadow: `0 8px 24px ${theme.primary}30, inset 0 1px 0 rgba(255,255,255,0.3)`
                }}
              >
                <Icon className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2" style={{ 
                color: theme.primary,
                textShadow: `0 2px 10px ${theme.primary}15`
              }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: `${theme.primary}B3` }}>{description}</p>
            </div>
          </div>
          
          {/* Gradient Button */}
          <button 
            className="mt-auto w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
              boxShadow: `0 4px 20px ${theme.primary}35, inset 0 1px 0 rgba(255,255,255,0.2)`
            }}
          >
            Launch Interface →
          </button>
        </div>
        )}
      </div>
    </motion.div>
  );
}

function SmallCardMale({ icon: Icon, title, onClick, theme }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -6 }}
      onClick={onClick}
      className="relative p-6 rounded-2xl backdrop-blur-xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.75) 100%)',
        borderColor: `${theme.primary}40`,
        boxShadow: `0 4px 16px ${theme.primary}12, inset 0 1px 0 rgba(255,255,255,0.6)`
      }}
    >
      {/* Hover Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
      />
      <div className="relative">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary}15, ${theme.accent}10)`,
            boxShadow: `0 2px 12px ${theme.primary}15`
          }}
        >
          <Icon className="w-7 h-7" style={{ color: theme.primary }} />
        </div>
        <h3 className="text-lg font-bold" style={{ 
          color: theme.primary,
          textShadow: `0 1px 6px ${theme.primary}10`
        }}>{title}</h3>
      </div>
    </motion.div>
  );
}

function AnalyticsCardMale({ onClick, theme }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-8 rounded-3xl backdrop-blur-xl border-2 cursor-pointer relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderColor: `${theme.primary}50`
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: theme.primary }}>
            Emotional Analytics Dashboard
          </h3>
          <p style={{ color: `${theme.primary}B3` }}>
            View detailed insights into your emotional patterns and AI interactions
          </p>
        </div>
        <BarChart3 className="w-16 h-16" style={{ color: theme.primary, opacity: 0.5 }} />
      </div>
    </motion.div>
  );
}

// Components for Female Dashboard - Soft Pastel Styling
function CircularStat({ value, label, theme }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -5 }}
      className="relative"
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-32 h-32 rounded-full backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 100%)',
          boxShadow: '0 8px 32px rgba(249, 168, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
        
        <svg className="w-32 h-32 relative" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#F9A8D4', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#DDD6FE', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#BAE6FD', stopOpacity: 0.8 }} />
            </linearGradient>
            <filter id={`glow-${label}`}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="0" result="offsetblur"/>
              <feFlood floodColor="#F9A8D4" floodOpacity="0.4"/>
              <feComposite in2="offsetblur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(249, 168, 212, 0.2)"
            strokeWidth="6"
          />
          
          {/* Animated Progress Circle with Gradient */}
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={`url(#gradient-${label})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${Math.min(value * 4, 264)} 264`}
            initial={{ strokeDasharray: "0 264" }}
            animate={{ strokeDasharray: `${Math.min(value * 4, 264)} 264` }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            transform="rotate(-90 50 50)"
            style={{ filter: `url(#glow-${label})` }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className="text-3xl font-bold" 
            style={{ 
              background: 'linear-gradient(135deg, #D873A6 0%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {value}
          </div>
          <div 
            className="text-sm mt-1 font-medium" 
            style={{ color: '#7A6BA8' }}
          >
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ElegantCard({ icon: Icon, title, description, onClick, theme, gradient, showIllustration, gender, cardType = 'chat' }: any) {
  // Define pastel colors for different card types
  const cardColors: Record<string, { gradient: string; icon: string; border: string }> = {
    chat: {
      gradient: 'linear-gradient(135deg, rgba(249, 168, 212, 0.15) 0%, rgba(221, 214, 254, 0.15) 100%)',
      icon: 'linear-gradient(135deg, #F9A8D4 0%, #DDD6FE 100%)',
      border: 'rgba(249, 168, 212, 0.3)'
    },
    profile: {
      gradient: 'linear-gradient(135deg, rgba(251, 207, 232, 0.15) 0%, rgba(233, 213, 255, 0.15) 100%)',
      icon: 'linear-gradient(135deg, #FBCFE8 0%, #E9D5FF 100%)',
      border: 'rgba(251, 207, 232, 0.3)'
    },
    history: {
      gradient: 'linear-gradient(135deg, rgba(221, 214, 254, 0.15) 0%, rgba(186, 230, 253, 0.15) 100%)',
      icon: 'linear-gradient(135deg, #DDD6FE 0%, #BAE6FD 100%)',
      border: 'rgba(221, 214, 254, 0.3)'
    },
    analytics: {
      gradient: 'linear-gradient(135deg, rgba(253, 224, 71, 0.12) 0%, rgba(251, 207, 232, 0.15) 100%)',
      icon: 'linear-gradient(135deg, #FDE047 0%, #FBCFE8 100%)',
      border: 'rgba(253, 224, 71, 0.25)'
    }
  };

  const colors = cardColors[cardType] || cardColors.chat;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      onClick={onClick}
      className="relative p-8 rounded-[2rem] backdrop-blur-2xl border cursor-pointer overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.5) 100%)',
        borderColor: colors.border,
        boxShadow: '0 8px 32px rgba(249, 168, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Soft Pastel Gradient Overlay */}
      <motion.div 
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0"
        style={{ 
          background: colors.gradient,
        }}
      />
      
      <div className="relative">
        {/* Chat/Profile Illustration */}
        {showIllustration ? (
          <div className="flex flex-col h-full">
            {cardType === 'profile' ? (
              <div className="mb-6">
                <svg width="100%" height="200" viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="80" r="40" fill="url(#profile-gradient)"/>
                  <path d="M60 140 Q60 100, 100 100 Q140 100, 140 140 Z" fill="url(#profile-gradient)" opacity="0.8"/>
                  <defs>
                    <linearGradient id="profile-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FBCFE8" />
                      <stop offset="100%" stopColor="#E9D5FF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ) : (
              <ChatIllustration gender={gender} theme={theme} />
            )}
            <div className="p-6 flex-1 flex items-end">
              <button className="w-full py-4 rounded-2xl font-semibold text-white transition-all hover:scale-105" style={{
                background: 'linear-gradient(135deg, #F9A8D4 0%, #DDD6FE 100%)',
                boxShadow: '0 4px 20px rgba(249, 168, 212, 0.4)'
              }}>
                {cardType === 'profile' ? 'Profile Page →' : 'Launch Interface →'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Soft Glowing Icon Container */}
            <div className="relative w-16 h-16 mb-6">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: colors.icon }}
              />
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl"
                style={{ 
                  background: colors.gradient,
                  boxShadow: `0 4px 20px ${colors.border}, inset 0 1px 0 rgba(255,255,255,0.6)`,
                  border: `1px solid ${colors.border}`
                }}
              >
                <Icon className="w-8 h-8" style={{ 
                  background: colors.icon,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2" style={{ 
              background: 'linear-gradient(135deg, #D873A6 0%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>{title}</h3>
            <p className="text-sm leading-relaxed font-medium" style={{ color: '#7A6BA8' }}>{description}</p>
            
            {/* Soft Arrow Indicator */}
            <motion.div 
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-6 inline-flex items-center gap-2 font-medium" 
              style={{ color: '#D873A6' }}
            >
              <span>Explore</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
