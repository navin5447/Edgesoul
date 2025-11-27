// Dashboard Page - Premium Enterprise Grade Design
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  MessageSquare, History, LogOut, Settings, BarChart3,
  TrendingUp, Brain, Activity
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
        background: 'linear-gradient(180deg, #bfdbfe 0%, #dbeafe 40%, #e0f2fe 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full"
          style={{ borderColor: '#3b82f6' }}
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
      background: 'linear-gradient(135deg, #A8CFFB 0%, #C4D7F7 50%, #D3C7F8 100%)',
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
            opacity: 0.4,
          }}
        />
      ))}

      {/* Gradient Orbs - Soft Blue */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%)' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(147, 197, 253, 0.2), transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-10">
        {/* Top Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-6 py-4 rounded-2xl backdrop-blur-xl border flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.6)',
            borderColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ color: '#0f172a' }}>EdgeSoul AI</span>
            </div>
            <nav className="flex gap-6">
              <button className="text-sm font-medium" style={{ color: '#3b82f6' }}>Dashboard</button>
              <button className="text-sm font-medium" style={{ color: '#64748b' }}>About Us</button>
              <button className="text-sm font-medium" style={{ color: '#64748b' }}>Resources</button>
              <button className="text-sm font-medium" style={{ color: '#64748b' }}>Contact</button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100" style={{ color: '#64748b' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Premium Header - Removed old header */}
        <div style={{ display: 'none' }}>
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
              <h1 className="text-3xl font-bold drop-shadow-lg flex items-center gap-2" style={{ color: '#1e40af' }}>
                EdgeSoul <span className="text-lg font-normal" style={{ color: '#3b82f6' }}>AI</span>
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-xl border hover:bg-blue-500/10"
            style={{
              background: 'rgba(255,255,255,0.6)',
              color: '#3b82f6',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </button>
        </motion.div>
        </div>

        {/* Hero Section with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 p-12 rounded-3xl backdrop-blur-xl border overflow-hidden relative"
          style={{
            background: 'rgba(255,255,255,0.6)',
            borderColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)'
          }}
        >
          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: '#94a3b8' }}>Emotional Intelligence</p>
              <h2 className="text-5xl font-bold mb-5 leading-tight" style={{ color: '#0f172a' }}>
                Emotional Intelligence<br/>Dashboard Dashboard
              </h2>
              <p className="mb-8 leading-relaxed text-base" style={{ color: '#64748b' }}>
                Redesigned EdgeSoul AI emotional dashboard with a premium enterprise-grade aesthetic.
              </p>
              <button 
                onClick={() => router.push('/chat')}
                className="px-9 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-base"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)'
                }}
              >
                Launch Interface
              </button>
            </div>
            <div className="flex justify-center">
              <div style={{ transform: 'scale(0.85)' }}>
                <ChatIllustration gender={gender} theme={theme} />
              </div>
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
              color="#60a5fa"
            />
            <PremiumStatCard
              icon={Brain}
              label="Emotions Analyzed"
              value={stats.emotionsDetected.toLocaleString()}
              color="#a78bfa"
            />
            <PremiumStatCard
              icon={TrendingUp}
              label="Days Active"
              value={stats.daysActive}
              color="#f472b6"
            />
          </div>

          {/* Analytics Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8 p-8 rounded-3xl backdrop-blur-xl border"
            style={{
              background: 'rgba(255,255,255,0.5)',
              borderColor: 'rgba(255,255,255,0.8)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#0f172a' }}>Emotional Analytics Dashboard</h3>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ color: '#64748b' }}>
                  Line Charts
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium backdrop-blur transition-all" style={{ 
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.1)'
                }}>
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
                        rgba(96, 165, 250, 0.7) 0%, 
                        rgba(147, 197, 253, 0.5) 100%)`,
                      boxShadow: '0 -4px 16px rgba(96, 165, 250, 0.25)'
                    }}
                  />
                  <span className="text-xs" style={{ color: '#64748b' }}>{month}</span>
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

        {/* Bottom Right Floating Element */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="fixed bottom-8 right-8 w-16 h-16"
          style={{ opacity: 0.4 }}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 L90 90 L10 90 Z" fill="white" opacity="0.6"/>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

// Premium Stat Card Component
function PremiumStatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="p-7 rounded-3xl backdrop-blur-xl border relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.6)',
        borderColor: 'rgba(255,255,255,0.9)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)'
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ 
            background: `${color}20`,
            boxShadow: `0 4px 16px ${color}15`
          }}
        >
          <Icon className="w-8 h-8" style={{ color: color }} />
        </div>
        <div>
          <div className="text-4xl font-bold mb-1" style={{ color: '#0f172a' }}>{value}</div>
          <div className="text-sm font-medium" style={{ color: '#64748b' }}>{label}</div>
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
      className="p-6 rounded-2xl backdrop-blur-xl border cursor-pointer relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.5)',
        borderColor: 'rgba(255,255,255,0.8)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
      }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur"
          style={{ 
            background: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
          }}
        >
          <Icon className="w-6 h-6" style={{ color: '#3b82f6' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: '#0f172a' }}>{title}</h3>
      </div>
    </motion.div>
  );
}
