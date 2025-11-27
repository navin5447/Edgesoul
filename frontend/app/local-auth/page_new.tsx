// Login/Register Page - Purple Neon Futuristic Design
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import {
  hasRegisteredUser,
  isUserLoggedIn,
} from '@/lib/offline/localAuth';

export default function LocalAuthPage() {
  const router = useRouter();
  const { login, signup } = useLocalAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isUserLoggedIn()) {
      router.push('/dashboard');
      return;
    }
    if (!hasRegisteredUser()) {
      setIsLogin(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(username, password);
        if (result.success) {
          const userId = localStorage.getItem('edgesoul_user_id') || 'user_001';
          try {
            const profileRes = await fetch(`http://localhost:8000/api/v1/memory/profile/${userId}`);
            const profile = await profileRes.json();
            if (!profile.gender || profile.gender === 'not_set') {
              router.push('/gender-selection');
            } else {
              router.push('/dashboard');
            }
          } catch (err) {
            router.push('/gender-selection');
          }
        } else {
          setError(result.message);
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const result = await signup(username, password, email, displayName);
        if (result.success) {
          localStorage.removeItem('user_gender');
          localStorage.removeItem('edgesoul_gender');
          router.push('/gender-selection');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6" style={{
      background: 'linear-gradient(135deg, #5A1E78 0%, #3B0A59 50%, #150B38 100%)',
      fontFamily: "'Poppins', 'Inter', sans-serif"
    }}>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%)'
      }} />

      {/* Animated Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              background: i % 3 === 0 ? '#FF6EE7' : i % 3 === 1 ? '#68E1FD' : '#9D7CFF',
              boxShadow: `0 0 ${Math.random() * 15 + 8}px currentColor`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating Geometric Shapes */}
      <motion.div
        className="absolute top-20 left-20 w-24 h-24 border-2 border-[#FF6EE7] opacity-20"
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-32 right-32 w-32 h-32 border-2 border-[#68E1FD] rounded-full opacity-20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/3 right-20 w-20 h-20 border-2 border-[#9D7CFF] rounded-lg opacity-20"
        animate={{ rotate: [0, 180, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      {/* Back to Home Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl text-white/80 hover:text-white transition-all group"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
        whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(157, 124, 255, 0.4)' }}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Home</span>
      </motion.button>

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Center Spotlight Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 -z-10"
          style={{ background: 'radial-gradient(circle, #9D7CFF 0%, transparent 70%)' }} />

        {/* Logo with Neon Glow */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full relative mb-4"
            animate={{
              boxShadow: [
                '0 0 30px rgba(255, 110, 231, 0.6)',
                '0 0 50px rgba(104, 225, 253, 0.6)',
                '0 0 30px rgba(157, 124, 255, 0.6)',
                '0 0 50px rgba(255, 110, 231, 0.6)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              background: 'linear-gradient(135deg, #FF6EE7 0%, #9D7CFF 50%, #68E1FD 100%)',
            }}
          >
            <div className="absolute inset-1 bg-[#150B38] rounded-full flex items-center justify-center">
              <Sparkles className="w-9 h-9 text-[#FF6EE7]" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #FF6EE7 0%, #9D7CFF 50%, #68E1FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            EdgeSoul
          </h1>
          <p className="text-white/60">Your Offline AI Companion</p>
        </div>

        {/* Auth Form Card with Neon Border */}
        <motion.div
          className="relative p-8 rounded-3xl backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 2px rgba(157, 124, 255, 0.6)',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05)), linear-gradient(135deg, #FF6EE7, #9D7CFF, #68E1FD)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          {/* Welcome Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(157, 124, 255, 0.2), rgba(157, 124, 255, 0.1))',
                boxShadow: '0 0 20px rgba(157, 124, 255, 0.4), inset 0 0 15px rgba(157, 124, 255, 0.2)',
              }}>
              <Lock className="w-6 h-6 text-[#9D7CFF]" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/60 text-center mb-8">
            {isLogin ? 'Sign in to continue your journey' : 'Join EdgeSoul community today'}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 50, 50, 0.2), rgba(255, 50, 50, 0.1))',
                border: '1px solid rgba(255, 50, 50, 0.4)',
                boxShadow: '0 0 20px rgba(255, 50, 50, 0.3)',
              }}
            >
              <p className="text-red-200 text-sm text-center">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(157, 124, 255, 0.4), inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                  e.target.style.borderColor = 'rgba(157, 124, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                placeholder="Enter your username"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 20px rgba(157, 124, 255, 0.4), inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                      e.target.style.borderColor = 'rgba(157, 124, 255, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    placeholder="How should we call you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 20px rgba(157, 124, 255, 0.4), inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                      e.target.style.borderColor = 'rgba(157, 124, 255, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 20px rgba(157, 124, 255, 0.4), inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                    e.target.style.borderColor = 'rgba(157, 124, 255, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 20px rgba(157, 124, 255, 0.4), inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                    e.target.style.borderColor = 'rgba(157, 124, 255, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  placeholder="Confirm your password"
                  minLength={6}
                />
              </div>
            )}

            {/* Submit Button with Gradient Neon */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #FF6EE7 0%, #9D7CFF 100%)',
                boxShadow: '0 8px 24px rgba(255, 110, 231, 0.4), 0 0 40px rgba(157, 124, 255, 0.3)',
              }}
              whileHover={!loading ? { 
                scale: 1.02,
                boxShadow: '0 12px 32px rgba(255, 110, 231, 0.6), 0 0 60px rgba(157, 124, 255, 0.5)',
              } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-bold" style={{ color: '#FF6EE7' }}>
                {isLogin ? 'Register' : 'Login'}
              </span>
            </button>
          </div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-xl backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(104, 225, 253, 0.15), rgba(104, 225, 253, 0.08))',
              border: '1px solid rgba(104, 225, 253, 0.3)',
              boxShadow: '0 0 20px rgba(104, 225, 253, 0.2), inset 0 0 15px rgba(104, 225, 253, 0.1)',
            }}
          >
            <div className="flex items-center justify-center gap-3 text-[#68E1FD] text-sm">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">100% Offline • Secure</span>
            </div>
            <p className="text-white/50 text-xs text-center mt-2">
              Your data never leaves your device
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
