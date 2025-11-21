'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function ThemeTestPage() {
  const { theme, gender, setGender } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Load saved gender from localStorage
    const savedGender = localStorage.getItem('edgesoul_gender');
    if (savedGender) {
      setGender(savedGender as any);
    }
  }, [setGender]);

  return (
    <div 
      className="min-h-screen p-8 transition-all duration-500"
      style={{ 
        background: theme.gradient,
        fontFamily: theme.fontFamily 
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl mb-4"
            style={{ 
              fontWeight: theme.fontWeight.bold,
              color: '#fff'
            }}
          >
            🎨 Phase 2: UI Theming Test
          </h1>
          <p className="text-xl text-white/80">
            Current Theme: <strong>{gender.toUpperCase()}</strong>
          </p>
        </div>

        {/* Theme Switcher */}
        <div 
          className="backdrop-blur-lg p-8 mb-8"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: theme.borderRadius.xl,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: theme.shadow
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Switch Theme:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Male Button */}
            <button
              onClick={() => {
                setGender('male');
                localStorage.setItem('edgesoul_gender', 'male');
              }}
              className="p-6 text-white transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: gender === 'male' ? theme.primary : 'rgba(255,255,255,0.1)',
                borderRadius: theme.borderRadius.lg,
                border: `2px solid ${gender === 'male' ? theme.primaryLight : 'rgba(255,255,255,0.2)'}`,
                boxShadow: gender === 'male' ? theme.shadowHover : theme.shadow,
                fontWeight: theme.fontWeight.bold
              }}
            >
              <div className="text-4xl mb-2">👨</div>
              <div className="text-xl">Male Theme</div>
              <div className="text-sm opacity-80 mt-2">Blue/Dark • Bold • Sharp</div>
            </button>

            {/* Female Button */}
            <button
              onClick={() => {
                setGender('female');
                localStorage.setItem('edgesoul_gender', 'female');
              }}
              className="p-6 text-white transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: gender === 'female' ? theme.primary : 'rgba(255,255,255,0.1)',
                borderRadius: theme.borderRadius.lg,
                border: `2px solid ${gender === 'female' ? theme.primaryLight : 'rgba(255,255,255,0.2)'}`,
                boxShadow: gender === 'female' ? theme.shadowHover : theme.shadow,
                fontWeight: theme.fontWeight.bold
              }}
            >
              <div className="text-4xl mb-2">👩</div>
              <div className="text-xl">Female Theme</div>
              <div className="text-sm opacity-80 mt-2">Purple/Pink • Soft • Rounded</div>
            </button>

            {/* Other Button */}
            <button
              onClick={() => {
                setGender('other');
                localStorage.setItem('edgesoul_gender', 'other');
              }}
              className="p-6 text-white transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: gender === 'other' ? theme.primary : 'rgba(255,255,255,0.1)',
                borderRadius: theme.borderRadius.lg,
                border: `2px solid ${gender === 'other' ? theme.primaryLight : 'rgba(255,255,255,0.2)'}`,
                boxShadow: gender === 'other' ? theme.shadowHover : theme.shadow,
                fontWeight: theme.fontWeight.bold
              }}
            >
              <div className="text-4xl mb-2">⚧️</div>
              <div className="text-xl">Other Theme</div>
              <div className="text-sm opacity-80 mt-2">Green/Neutral • Balanced</div>
            </button>
          </div>
        </div>

        {/* Theme Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Chat Bubble Preview - User */}
          <div 
            className="p-6"
            style={{
              backgroundColor: theme.chatBubble.user,
              borderRadius: theme.chatBubble.borderRadius,
              boxShadow: theme.shadow,
              color: '#fff'
            }}
          >
            <div className="font-bold mb-2">User Message</div>
            <div>This is how your messages will look with the {gender} theme!</div>
          </div>

          {/* Chat Bubble Preview - Assistant */}
          <div 
            className="p-6"
            style={{
              backgroundColor: theme.chatBubble.assistant,
              borderRadius: theme.chatBubble.borderRadius,
              boxShadow: theme.shadow,
              color: '#fff'
            }}
          >
            <div className="font-bold mb-2">EdgeSoul Response</div>
            <div>This is how EdgeSoul's responses will appear!</div>
          </div>
        </div>

        {/* Emotion Colors Preview */}
        <div 
          className="backdrop-blur-lg p-8 mb-8"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: theme.borderRadius.xl,
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Emotion Colors:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(theme.emotions).map(([emotion, color]) => (
              <div 
                key={emotion}
                className="p-4 text-white text-center"
                style={{
                  backgroundColor: color,
                  borderRadius: theme.borderRadius.md,
                  boxShadow: theme.shadow
                }}
              >
                <div className="font-bold capitalize">{emotion}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Preview */}
        <div 
          className="backdrop-blur-lg p-8 mb-8"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: theme.borderRadius.xl,
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <h2 className="text-2xl text-white mb-6" style={{ fontWeight: theme.fontWeight.bold }}>
            Typography:
          </h2>
          <div className="space-y-4 text-white">
            <p style={{ fontWeight: theme.fontWeight.normal }}>
              Normal weight: {theme.fontWeight.normal}
            </p>
            <p style={{ fontWeight: theme.fontWeight.medium }}>
              Medium weight: {theme.fontWeight.medium}
            </p>
            <p style={{ fontWeight: theme.fontWeight.bold }}>
              Bold weight: {theme.fontWeight.bold}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 text-white transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: theme.primary,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadow,
              fontWeight: theme.fontWeight.bold
            }}
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/gender-selection')}
            className="px-8 py-4 text-white transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: theme.secondary,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadow,
              fontWeight: theme.fontWeight.bold
            }}
          >
            Gender Selection →
          </button>
        </div>

        {/* Current Theme JSON */}
        <div 
          className="mt-8 p-6 backdrop-blur-lg"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: theme.borderRadius.md,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Current Theme Config:</h3>
          <pre className="text-xs text-white/80 overflow-auto">
            {JSON.stringify(theme, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
