"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sun, Moon, Sparkles, User, Menu, X, Volume2, VolumeX } from "lucide-react";
import MessageList from "./MessageList";
import GenderAvatar from "../avatar/GenderAvatar";
import VoiceButton from "./VoiceButton";
import { useChatStore } from "@/lib/store/chatStore";
import { chatApi } from "@/lib/api/chatApi";
import { useTheme as useThemeHook } from "@/hooks/useTheme";
import { useTheme as useThemeContext } from "@/context/ThemeContext";
import { useLocalAuth } from "@/context/LocalAuthContext";
import { saveChatMessage } from "@/lib/offline/chatStorage";
import { useRouter } from "next/navigation";
import { EmotionType } from "@/lib/types/chat";
import { getTextToSpeech, isTextToSpeechSupported } from "@/lib/voice";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { theme, toggleTheme } = useThemeHook();
  const { theme: themeConfig, gender } = useThemeContext();
  const { user } = useLocalAuth();
  const router = useRouter();
  
  const { messages, addMessage, currentEmotion, clearMessages } = useChatStore();

  // Clear messages when gender changes
  useEffect(() => {
    clearMessages();
  }, [gender, clearMessages]);

  // Check if text-to-speech is supported
  useEffect(() => {
    setVoiceEnabled(isTextToSpeechSupported());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Stop any ongoing speech
    if (isSpeaking) {
      const tts = getTextToSpeech();
      tts.stop();
      setIsSpeaking(false);
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    const messageText = input.trim();
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('edgesoul_user_id') || 'user_001' : 'user_001';
      const response = await chatApi.sendMessage(messageText, userId);
      
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: response.response,
        timestamp: new Date(),
        emotion: {
          primary: response.emotion.primary as EmotionType,
          confidence: response.emotion.confidence,
          all: response.emotion.all_emotions
        },
      };

      setIsTyping(false);
      addMessage(aiMessage);

      // Auto-speak response if voice enabled
      if (voiceEnabled) {
        speakText(response.response);
      }

      // Save to IndexedDB if user is authenticated (non-blocking)
      if (user) {
        saveChatMessage(
          user.id,
          messageText,
          response.response,
          response.emotion.primary
        ).catch(error => {
          console.warn('Failed to save to IndexedDB:', error);
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    // Add voice transcript to input
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    
    // Auto-submit if transcript ends with clear intent
    const lowerTranscript = transcript.toLowerCase().trim();
    if (lowerTranscript.endsWith('.') || lowerTranscript.endsWith('?') || lowerTranscript.endsWith('!')) {
      // Wait a moment then submit
      setTimeout(() => {
        if (inputRef.current) {
          const form = inputRef.current.form;
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        }
      }, 500);
    }
  };

  const speakText = (text: string) => {
    if (!voiceEnabled) return;

    const tts = getTextToSpeech();
    
    setIsSpeaking(true);
    tts.speak(
      text,
      {
        enabled: true,
        speed: 1.0,
        pitch: 1.0,
        gender: gender || 'not_set'
      },
      () => {
        setIsSpeaking(false);
      },
      (error) => {
        console.error('TTS error:', error);
        setIsSpeaking(false);
      }
    );
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      const tts = getTextToSpeech();
      tts.stop();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      className="flex h-full transition-colors duration-300 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #A8CFFB 0%, #C4D7F7 50%, #D3C7F8 100%)',
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Floating Light Particles - Match Dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
              boxShadow: '0 0 12px rgba(255,255,255,0.6)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Soft Gradient Orbs */}
      <div className="absolute top-10 right-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-60" 
        style={{ background: 'radial-gradient(circle, rgba(168, 207, 251, 0.4) 0%, rgba(168, 207, 251, 0) 70%)' }} />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] rounded-full blur-3xl opacity-60" 
        style={{ background: 'radial-gradient(circle, rgba(211, 199, 248, 0.4) 0%, rgba(211, 199, 248, 0) 70%)' }} />

      {/* Avatar Sidebar */}
      <div 
        className="hidden lg:flex flex-col w-80 border-r backdrop-blur-2xl relative z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)'
        }}
      >
        <div className="p-6 flex flex-col items-center justify-center h-full">
          <div className="text-center mb-6">
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: '#0f172a' }}
            >
              EdgeSoul
            </h3>
            <p 
              className="text-sm"
              style={{ color: '#64748b' }}
            >
              Your Emotional AI Companion
            </p>
          </div>
          
          {/* Animated Avatar with Soft Glow */}
          <div className="mb-6 relative">
            <div 
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ 
                background: 'radial-gradient(circle, rgba(168, 207, 251, 0.6) 0%, rgba(168, 207, 251, 0) 70%)',
                transform: 'scale(1.2)'
              }}
            />
            <div className="relative backdrop-blur-xl rounded-3xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
              }}>
              <GenderAvatar 
                emotion={currentEmotion?.primary.toLowerCase() || 'neutral'} 
                gender={gender}
                size={180}
              />
            </div>
          </div>

          {/* Emotion Info - Frosted Glass Pill */}
          {currentEmotion && (
            <div 
              className="w-full px-6 py-4 rounded-2xl backdrop-blur-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
              }}
            >
              <div className="text-center">
                <p 
                  className="text-xs font-semibold mb-2 tracking-wider uppercase"
                  style={{ color: '#64748b' }}
                >
                  Current Emotion
                </p>
                <p 
                  className="text-2xl font-bold capitalize"
                  style={{ color: '#0f172a' }}
                >
                  {currentEmotion.primary}
                </p>
                <p 
                  className="text-xs mt-1 font-medium"
                  style={{ color: '#64748b' }}
                >
                  {Math.round(currentEmotion.confidence)}% confidence
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 relative z-10">
        {/* Header - Frosted Glass Navigation */}
        <header 
          className="sticky top-0 z-10 border-b backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.35) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          }}
        >
          <div className="container mx-auto max-w-4xl px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                {/* Mobile Avatar */}
                <div className="lg:hidden">
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-full blur-xl"
                      style={{ 
                        background: 'radial-gradient(circle, rgba(168, 207, 251, 0.5) 0%, rgba(168, 207, 251, 0) 70%)'
                      }}
                    />
                    <div className="relative">
                      <GenderAvatar 
                        emotion={currentEmotion?.primary?.toLowerCase?.() || 'neutral'} 
                        gender={gender}
                        size={60}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="relative hidden lg:block">
                  <div 
                    className="absolute inset-0 rounded-xl blur-md"
                    style={{ background: 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)' }}
                  ></div>
                  <div 
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ 
                      background: 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
                      boxShadow: '0 4px 14px rgba(53, 139, 255, 0.35)'
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: '#0f172a' }}
                  >
                    EdgeSoul
                  </h1>
                  {currentEmotion && (
                    <p 
                      className="text-xs sm:text-sm"
                      style={{ color: '#64748b' }}
                    >
                      Feeling: {currentEmotion.primary} {getEmotionEmoji(currentEmotion.primary)}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Voice Toggle */}
                {isTextToSpeechSupported() && (
                  <button
                    onClick={toggleVoice}
                    className="rounded-xl p-2 transition-all hover:scale-105"
                    style={{
                      background: voiceEnabled 
                        ? 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)' 
                        : 'rgba(255, 255, 255, 0.6)',
                      color: voiceEnabled ? 'white' : '#64748b',
                      boxShadow: voiceEnabled 
                        ? '0 4px 14px rgba(53, 139, 255, 0.35)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.7)'
                    }}
                    aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                    title={voiceEnabled ? 'Voice enabled (bot will speak)' : 'Voice disabled'}
                  >
                    {voiceEnabled ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <VolumeX className="h-5 w-5" />
                    )}
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#358BFF' }}></span>
                        <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#358BFF' }}></span>
                      </span>
                    )}
                  </button>
                )}

                {/* Back to Dashboard Button */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    color: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }}
                  aria-label="Back to Dashboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Dashboard</span>
                </button>

                {/* Mobile Back Button */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="sm:hidden rounded-xl p-2 transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    color: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.7)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'}
                  aria-label="Back to Dashboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>

                <button
                  onClick={toggleTheme}
                  className="rounded-xl p-2 transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    color: theme === 'dark' ? '#FCD34D' : '#64748b',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                {/* Profile Button */}
                <button
                  onClick={() => router.push('/profile')}
                  className="rounded-xl p-2 transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    color: '#64748b',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }}
                  aria-label="Profile"
                >
                  <User className="h-5 w-5" />
                </button>
              </div>
          </div>
        </div>
      </header>

        {/* Messages Area - Smooth Scrolling */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            messages={messages} 
            isLoading={isLoading} 
            isTyping={isTyping}
            theme={theme}
          />
        </div>

        {/* Input Area - Frosted Glass */}
        <div 
          className="sticky bottom-0 border-t backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.35) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          }}
        >
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSubmit}>
            <div 
              className="relative flex items-end gap-2 rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(53, 139, 255, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(53, 139, 255, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              {/* Voice Input Button */}
              <div className="ml-2 mb-2">
                <VoiceButton
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                  theme={theme}
                />
              </div>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message EdgeSoul..."
                className="flex-1 resize-none bg-transparent px-4 py-3 sm:py-4 outline-none"
                rows={1}
                style={{ maxHeight: "200px", color: '#0f172a' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="m-2 rounded-xl p-2 sm:p-2.5 transition-all"
                style={{
                  background: !input.trim() || isLoading 
                    ? 'rgba(168, 207, 251, 0.3)' 
                    : 'linear-gradient(135deg, #358BFF 0%, #79B7FF 100%)',
                  color: 'white',
                  cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: !input.trim() || isLoading ? 'none' : '0 4px 14px rgba(53, 139, 255, 0.35)'
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(53, 139, 255, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = !input.trim() || isLoading ? 'none' : '0 4px 14px rgba(53, 139, 255, 0.35)';
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
          <p 
            className="mt-2 text-center text-xs"
            style={{ color: '#64748b' }}
          >
            {voiceEnabled && isSpeaking ? (
              <span style={{ color: '#358BFF' }} className="font-medium">🔊 Speaking...</span>
            ) : voiceEnabled ? (
              <span style={{ color: '#358BFF' }} className="font-medium">🎤 Voice enabled - Click mic to speak (needs internet) | Bot speaks offline ✓</span>
            ) : (
              'EdgeSoul can make mistakes. Check important info.'
            )}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for emotion emojis
function getEmotionEmoji(emotion: string): string {
  const emojis: Record<string, string> = {
    joy: "😊",
    sadness: "😢",
    anger: "😡",
    fear: "😱",
    surprise: "😲",
    love: "❤️",
    neutral: "😐",
  };
  return emojis[emotion.toLowerCase()] || "😊";
}
