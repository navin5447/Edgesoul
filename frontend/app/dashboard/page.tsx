// Dashboard Page - Gender-Based Premium Designs
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  MessageSquare, History, LogOut, Settings, BarChart3,
  TrendingUp, Brain, Activity, Search, Zap
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
        background: gender === 'female' 
          ? 'linear-gradient(135deg, #FFE5F1 0%, #F3E5F5 25%, #E8EAF6 50%, #E1F5FE 75%, #FFE5F1 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full"
          style={{ borderColor: gender === 'female' ? '#FFB6D9' : 'white' }}
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      {gender === 'female' ? (
        <GirlDashboard 
          theme={theme}
          user={user}
          stats={stats}
          handleLogout={handleLogout}
          router={router}
          gender={gender}
        />
      ) : (
        <EnterpriseDashboard 
          theme={theme}
          user={user}
          stats={stats}
          handleLogout={handleLogout}
          router={router}
          gender={gender}
        />
      )}
    </ProtectedRoute>
  );
}

// ENTERPRISE DASHBOARD - Premium Glassmorphism Design (For Male/Default)
function EnterpriseDashboard({ theme, user, stats, handleLogout, router, gender }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #A8DAFF 0%, #C4E0FB 50%, #D8E9FF 100%)',
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
        style={{ background: 'radial-gradient(circle, rgba(168, 218, 255, 0.4), transparent 70%)' }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(196, 224, 251, 0.35), transparent 70%)' }}
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
                className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #5BA3F5 0%, #78C3FB 100%)',
                  boxShadow: '0 8px 32px rgba(91, 163, 245, 0.3)'
                }}
              >
                <Brain className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 drop-shadow-sm flex items-center gap-2">
                EdgeSoul <span className="text-lg font-normal text-gray-600">AI</span>
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 text-white"
            style={{
              background: 'linear-gradient(135deg, #5BA3F5 0%, #78C3FB 100%)',
              boxShadow: '0 4px 16px rgba(91, 163, 245, 0.4)'
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
          className="mb-10 p-12 rounded-3xl backdrop-blur-xl border border-white/40 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.6))',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}
        >
          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2 tracking-wider uppercase">AI-POWERED COMPANION</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Emotional Intelligence<br/>Chatbot
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Experience conversations that understand your emotions. Chat with EdgeSoul AI and get empathetic responses tailored to your feelings.
              </p>
              <button 
                onClick={() => router.push('/chat')}
                className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #5BA3F5 0%, #78C3FB 100%)',
                  boxShadow: '0 8px 24px rgba(91, 163, 245, 0.4)'
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
              color="#5BA3F5"
            />
            <PremiumStatCard
              icon={Brain}
              label="Emotions Analyzed"
              value={stats.emotionsDetected.toLocaleString()}
              color="#78C3FB"
            />
            <PremiumStatCard
              icon={TrendingUp}
              label="Days Active"
              value={stats.daysActive}
              color="#A8DAFF"
            />
          </div>

          {/* Analytics Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8 p-8 rounded-3xl backdrop-blur-xl border border-white/40"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.6))',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Emotional Analytics Dashboard</h3>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-white/20 transition-all">
                  Line Charts
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 transition-all">
                  Data Visualization
                </button>
              </div>
            </div>
            
            {/* Curved Chart Area */}
            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(91, 163, 245, 0.4)" />
                    <stop offset="100%" stopColor="rgba(91, 163, 245, 0.05)" />
                  </linearGradient>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0.05)" />
                  </linearGradient>
                </defs>
                
                {/* Blue Curve */}
                <path
                  d="M 0 120 Q 100 80 200 100 T 400 90 T 600 80 T 800 70"
                  fill="url(#blueGradient)"
                  stroke="#5BA3F5"
                  strokeWidth="3"
                  opacity="0.9"
                />
                
                {/* Purple Curve */}
                <path
                  d="M 0 140 Q 100 110 200 125 T 400 120 T 600 110 T 800 100"
                  fill="url(#purpleGradient)"
                  stroke="#A855F7"
                  strokeWidth="3"
                  opacity="0.7"
                />
              </svg>
              
              {/* Month Labels */}
              <div className="flex justify-between mt-3 px-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month) => (
                  <span key={month} className="text-xs text-gray-500">{month}</span>
                ))}
              </div>
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
      className="p-6 rounded-2xl backdrop-blur-xl border border-white/40 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${color}30, ${color}15)`,
            boxShadow: `0 4px 16px ${color}25`
          }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-600 font-medium">{label}</div>
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
      className="p-6 rounded-2xl backdrop-blur-xl border border-white/40 cursor-pointer relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(91, 163, 245, 0.2), rgba(120, 195, 251, 0.1))',
            boxShadow: '0 4px 12px rgba(91, 163, 245, 0.2)'
          }}
        >
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
    </motion.div>
  );
}

// GIRL DASHBOARD - Soft Feminine Pastel Aesthetic  
function GirlDashboard({ theme, user, stats, handleLogout, router, gender }: any) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #FFE5F1 0%, #F3E5F5 25%, #E8EAF6 50%, #E1F5FE 75%, #FFE5F1 100%)',
      fontFamily: "'Poppins', 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* Floating Sparkles & Glitter Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: Math.random() * 6 + 3 + 'px',
              height: Math.random() * 6 + 3 + 'px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 1, 0.2],
              scale: [0.6, 1.4, 0.6],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z" 
                fill={`rgba(${Math.random() > 0.5 ? '255, 182, 217' : '230, 213, 245'}, ${0.6 + Math.random() * 0.4})`}
                style={{ filter: 'drop-shadow(0 0 4px rgba(255, 182, 217, 0.8))' }}
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Soft Pastel Gradient Orbs */}
      <div className="absolute top-20 right-10 w-[600px] h-[600px] rounded-full blur-3xl" 
        style={{ background: 'radial-gradient(circle, rgba(255, 182, 217, 0.4) 0%, rgba(255, 182, 217, 0) 70%)' }} />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-3xl" 
        style={{ background: 'radial-gradient(circle, rgba(230, 213, 245, 0.4) 0%, rgba(230, 213, 245, 0) 70%)' }} />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-3xl" 
        style={{ background: 'radial-gradient(circle, rgba(194, 233, 245, 0.3) 0%, rgba(194, 233, 245, 0) 70%)' }} />

      {/* Floating Hearts & Flowers Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute"
          style={{ bottom: '8%', right: '6%' }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <path d="M50 85C50 85 15 60 15 35C15 20 25 10 35 10C42 10 47 14 50 20C53 14 58 10 65 10C75 10 85 20 85 35C85 60 50 85 50 85Z" 
              fill="rgba(255, 182, 217, 0.5)" 
              style={{ filter: 'drop-shadow(0 4px 12px rgba(255, 182, 217, 0.4))' }}
            />
          </svg>
        </motion.div>

        {[
          { top: '15%', left: '10%', size: 35, type: 'heart', delay: 0 },
          { top: '25%', right: '15%', size: 30, type: 'flower', delay: 2 },
          { top: '60%', left: '8%', size: 40, type: 'heart', delay: 4 },
          { top: '70%', right: '20%', size: 25, type: 'flower', delay: 1 },
          { top: '40%', left: '5%', size: 20, type: 'heart', delay: 3 },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={item}
            animate={{ 
              rotate: item.type === 'flower' ? [0, 360] : [0, 10, 0, -10, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 12 + i * 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: item.delay
            }}
          >
            {item.type === 'heart' ? (
              <svg width={item.size} height={item.size} viewBox="0 0 50 50" fill="none">
                <path d="M25 42C25 42 8 30 8 17C8 10 12 5 17 5C21 5 23 7 25 10C27 7 29 5 33 5C38 5 42 10 42 17C42 30 25 42 25 42Z" 
                  fill="rgba(255, 182, 217, 0.6)"
                />
              </svg>
            ) : (
              <svg width={item.size} height={item.size} viewBox="0 0 50 50" fill="none">
                <circle cx="25" cy="25" r="8" fill="rgba(255, 213, 204, 0.7)" />
                {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                  <ellipse key={idx} cx="25" cy="25" rx="12" ry="6" 
                    fill="rgba(230, 213, 245, 0.6)" 
                    transform={`rotate(${angle} 25 25)`}
                  />
                ))}
              </svg>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        
        {/* Navigation Bar */}
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="backdrop-blur-2xl rounded-3xl px-6 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 240, 250, 0.5) 100%)',
              boxShadow: '0 8px 32px rgba(255, 182, 217, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              border: '1.5px solid rgba(255, 240, 250, 0.8)'
            }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFB6D9 0%, #E6D5F5 100%)',
                    boxShadow: '0 4px 16px rgba(255, 182, 217, 0.4)'
                  }}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#7A6BA8' }}>EdgeSoul AI</span>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                {['Dashboard', 'About Us', 'Resources', 'Contact'].map((item) => (
                  <button
                    key={item}
                    className="hover:opacity-70 transition-opacity font-medium text-sm"
                    style={{ color: '#B5A3C7' }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-white/40 rounded-2xl transition-colors">
                  <Search className="w-5 h-5" style={{ color: '#D873A6' }} />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white px-6 py-2.5 rounded-2xl hover:shadow-2xl transition-all font-semibold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #FFB6D9 0%, #E6D5F5 100%)',
                    boxShadow: '0 6px 24px rgba(255, 182, 217, 0.4)'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="backdrop-blur-2xl rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 240, 250, 0.55) 50%, rgba(243, 229, 245, 0.6) 100%)',
              boxShadow: '0 8px 32px rgba(255, 182, 217, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.98)',
              border: '2px solid rgba(255, 240, 250, 0.9)'
            }}>
            
            <div className="grid grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <motion.p 
                    className="text-xs font-semibold mb-3 tracking-widest uppercase"
                    style={{ color: '#D873A6', letterSpacing: '0.15em' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    ✨ Your AI Companion
                  </motion.p>
                  <motion.h1 
                    className="text-5xl font-bold leading-tight"
                    style={{ 
                      background: 'linear-gradient(135deg, #D873A6 0%, #7A6BA8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    Emotional Intelligence<br />Chatbot
                  </motion.h1>
                </div>

                <motion.p 
                  className="text-base leading-relaxed"
                  style={{ color: '#B5A3C7' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  Experience conversations that understand your emotions. Chat with EdgeSoul AI and get empathetic responses tailored to your feelings. 💕
                </motion.p>

                <motion.button
                  onClick={() => router.push('/chat')}
                  className="inline-flex items-center space-x-2 text-white px-7 py-3.5 rounded-2xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #FFB6D9 0%, #E6D5F5 50%, #C4A3F3 100%)',
                    boxShadow: '0 8px 28px rgba(255, 182, 217, 0.45)'
                  }}
                  whileHover={{ scale: 1.03, boxShadow: '0 10px 36px rgba(255, 182, 217, 0.55)' }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                >
                  <span>Launch Interface ✨</span>
                </motion.button>
              </div>

              <div className="flex justify-center items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative w-full"
                  style={{ maxWidth: '500px' }}
                >
                  <ChatIllustration gender={gender} theme={theme} />
                  <div className="absolute inset-0 -z-10 blur-3xl opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(255, 182, 217, 0.4), transparent 70%)' }} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-2xl rounded-3xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 240, 250, 0.6) 100%)',
                boxShadow: '0 6px 24px rgba(255, 182, 217, 0.2)',
                border: '1.5px solid rgba(255, 240, 250, 0.9)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#B5A3C7' }}>Total Sessions</p>
                  <p className="text-4xl font-bold" style={{ color: '#7A6BA8' }}>
                    {stats.conversations.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 182, 217, 0.3) 0%, rgba(255, 201, 221, 0.2) 100%)',
                    boxShadow: '0 0 20px rgba(255, 182, 217, 0.4)'
                  }}>
                  <Activity className="w-6 h-6" style={{ color: '#FFB6D9' }} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-2xl rounded-3xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(243, 229, 245, 0.6) 100%)',
                boxShadow: '0 6px 24px rgba(230, 213, 245, 0.25)',
                border: '1.5px solid rgba(243, 229, 245, 0.9)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#B5A3C7' }}>Emotions Analyzed</p>
                  <p className="text-4xl font-bold" style={{ color: '#7A6BA8' }}>
                    {(stats.emotionsDetected / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(230, 213, 245, 0.4) 0%, rgba(216, 191, 248, 0.3) 100%)',
                    boxShadow: '0 0 20px rgba(230, 213, 245, 0.5)'
                  }}>
                  <Brain className="w-6 h-6" style={{ color: '#E6D5F5' }} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="backdrop-blur-2xl rounded-3xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(225, 245, 254, 0.6) 100%)',
                boxShadow: '0 6px 24px rgba(194, 233, 245, 0.25)',
                border: '1.5px solid rgba(225, 245, 254, 0.9)'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#B5A3C7' }}>Days Active</p>
                  <p className="text-4xl font-bold" style={{ color: '#7A6BA8' }}>
                    {stats.daysActive}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(194, 233, 245, 0.4) 0%, rgba(184, 224, 245, 0.3) 100%)',
                    boxShadow: '0 0 20px rgba(194, 233, 245, 0.5)'
                  }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#C2E9F5' }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Analytics Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-8 backdrop-blur-2xl rounded-3xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 248, 250, 0.6) 100%)',
              boxShadow: '0 6px 24px rgba(255, 182, 217, 0.2)',
              border: '1.5px solid rgba(255, 240, 250, 0.9)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#7A6BA8' }}>
                Emotional Analytics Dashboard
              </h3>
              <div className="flex items-center space-x-4">
                <button className="text-sm font-medium px-4 py-1.5 rounded-2xl transition-colors" 
                  style={{ color: '#B5A3C7' }}>
                  Line Charts
                </button>
                <button className="text-sm font-semibold px-4 py-1.5 rounded-2xl" 
                  style={{ 
                    color: '#D873A6',
                    background: 'rgba(255, 182, 217, 0.2)'
                  }}>
                  Data Visualization
                </button>
              </div>
            </div>

            <div className="relative h-64">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-medium" style={{ color: '#B5A3C7' }}>
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              <svg className="w-full h-full pl-8" viewBox="0 0 900 250" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="girlPinkGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 182, 217, 0.4)" />
                    <stop offset="100%" stopColor="rgba(255, 182, 217, 0)" />
                  </linearGradient>
                  <linearGradient id="girlLavenderGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(230, 213, 245, 0.4)" />
                    <stop offset="100%" stopColor="rgba(230, 213, 245, 0)" />
                  </linearGradient>
                  <filter id="girlSoftGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M 0 120 Q 100 80, 200 100 T 400 110 T 600 90 T 800 100 T 900 80"
                  fill="url(#girlPinkGlow)"
                  stroke="#FFB6D9"
                  strokeWidth="3"
                  filter="url(#girlSoftGlow)"
                  opacity="0.9"
                />

                <path
                  d="M 0 140 Q 100 100, 200 120 T 400 130 T 600 110 T 800 140 T 900 130"
                  fill="url(#girlLavenderGlow)"
                  stroke="#E6D5F5"
                  strokeWidth="3"
                  filter="url(#girlSoftGlow)"
                  opacity="0.85"
                />
              </svg>

              <div className="flex justify-between mt-3 text-xs font-medium" style={{ color: '#B5A3C7' }}>
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
          <button
            onClick={() => router.push('/profile')}
            className="backdrop-blur-2xl rounded-3xl p-6 hover:scale-105 transition-transform text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 240, 250, 0.6) 100%)',
              boxShadow: '0 6px 24px rgba(255, 182, 217, 0.2)',
              border: '1.5px solid rgba(255, 240, 250, 0.9)'
            }}
          >
            <Settings className="w-8 h-8 mb-3" style={{ color: '#FFB6D9' }} />
            <h4 className="font-semibold mb-1" style={{ color: '#7A6BA8' }}>Profile Settings</h4>
            <p className="text-sm" style={{ color: '#B5A3C7' }}>Manage your preferences</p>
          </button>

          <button
            onClick={() => router.push('/history')}
            className="backdrop-blur-2xl rounded-3xl p-6 hover:scale-105 transition-transform text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(243, 229, 245, 0.6) 100%)',
              boxShadow: '0 6px 24px rgba(230, 213, 245, 0.25)',
              border: '1.5px solid rgba(243, 229, 245, 0.9)'
            }}
          >
            <History className="w-8 h-8 mb-3" style={{ color: '#E6D5F5' }} />
            <h4 className="font-semibold mb-1" style={{ color: '#7A6BA8' }}>Conversation History</h4>
            <p className="text-sm" style={{ color: '#B5A3C7' }}>View past conversations</p>
          </button>

          <button
            onClick={() => router.push('/analytics')}
            className="backdrop-blur-2xl rounded-3xl p-6 hover:scale-105 transition-transform text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(225, 245, 254, 0.6) 100%)',
              boxShadow: '0 6px 24px rgba(194, 233, 245, 0.25)',
              border: '1.5px solid rgba(225, 245, 254, 0.9)'
            }}
          >
            <BarChart3 className="w-8 h-8 mb-3" style={{ color: '#C2E9F5' }} />
            <h4 className="font-semibold mb-1" style={{ color: '#7A6BA8' }}>Analytics</h4>
            <p className="text-sm" style={{ color: '#B5A3C7' }}>Detailed insights</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
