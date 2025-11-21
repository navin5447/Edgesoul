"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sun, Moon, Sparkles, User, Menu, X, Volume2, VolumeX } from "lucide-react";
import MessageList from "./MessageList";
import Avatar2D from "../avatar/Avatar2D";
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
  const { gender } = useThemeContext();
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
    <div className={`flex h-full transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950' 
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
    }`}>
      {/* Avatar Sidebar */}
      <div className={`hidden lg:flex flex-col w-80 border-r ${
        theme === 'dark' ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="p-6 flex flex-col items-center justify-center h-full">
          <div className={`text-center mb-6`}>
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              EdgeSoul
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your Emotional AI Companion
            </p>
          </div>
          
          {/* Animated Avatar */}
          <div className="mb-6">
            <Avatar2D 
              emotion={currentEmotion?.primary.toLowerCase() || 'neutral'} 
              size={200}
            />
          </div>

          {/* Emotion Info */}
          {currentEmotion && (
            <div className={`w-full p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Current Emotion
                </p>
                <p className={`text-2xl font-bold capitalize ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentEmotion.primary}
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {Math.round(currentEmotion.confidence)}% confidence
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header - ChatGPT Style */}
        <header className={`sticky top-0 z-10 border-b backdrop-blur-sm ${
          theme === 'dark' 
            ? 'border-gray-800 bg-gray-900/80' 
            : 'border-gray-200 bg-white/80'
        }`}>
          <div className="container mx-auto max-w-4xl px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                {/* Mobile Avatar */}
                <div className="lg:hidden">
                  <Avatar2D 
                    emotion={currentEmotion?.primary?.toLowerCase?.() || 'neutral'} 
                    size={60}
                  />
                </div>
                
                <div className="relative hidden lg:block">
                  <div className={`absolute inset-0 rounded-full blur-md ${
                    theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-500/20'
                  }`}></div>
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className={`text-lg sm:text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    EdgeSoul
                  </h1>
                  {currentEmotion && (
                    <p className={`text-xs sm:text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Feeling: {currentEmotion.primary} {getEmotionEmoji(currentEmotion.primary)}
                    </p>
                  )}
                </div>
              </div>

              {/* Theme Toggle & Navigation */}
              <div className="flex items-center gap-2">
                {/* Voice Toggle */}
                {isTextToSpeechSupported() && (
                  <button
                    onClick={toggleVoice}
                    className={`rounded-full p-2 transition-all hover:scale-110 ${
                      voiceEnabled
                        ? theme === 'dark'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                        : theme === 'dark'
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
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
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </span>
                    )}
                  </button>
                )}

                {/* Back to Dashboard Button */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
                  className={`sm:hidden rounded-full p-2 transition-all hover:scale-110 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label="Back to Dashboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>

                <button
                  onClick={toggleTheme}
                  className={`rounded-full p-2 transition-all hover:scale-110 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
                  className={`rounded-full p-2 transition-all hover:scale-110 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-purple-400 hover:bg-gray-700' 
                      : 'bg-gray-100 text-purple-600 hover:bg-gray-200'
                  }`}
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

        {/* Input Area - ChatGPT Style */}
        <div className={`sticky bottom-0 border-t backdrop-blur-sm ${
          theme === 'dark' 
            ? 'border-gray-800 bg-gray-900/80' 
            : 'border-gray-200 bg-white/80'
        }`}>
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSubmit}>
            <div className={`relative flex items-end gap-2 rounded-2xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-gray-700 bg-gray-800 focus-within:border-purple-500'
                : 'border-gray-200 bg-white focus-within:border-purple-400 shadow-lg'
            }`}>
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
                className={`flex-1 resize-none bg-transparent px-4 py-3 sm:py-4 outline-none ${
                  theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                }`}
                rows={1}
                style={{ maxHeight: "200px" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`m-2 rounded-xl p-2 sm:p-2.5 transition-all ${
                  !input.trim() || isLoading
                    ? theme === 'dark' 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-lg'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:scale-105 hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
          <p className={`mt-2 text-center text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {voiceEnabled && isSpeaking ? (
              <span className="text-purple-500 font-medium">🔊 Speaking...</span>
            ) : voiceEnabled ? (
              <span className="text-purple-500 font-medium">🎤 Voice enabled - Click mic to speak (needs internet) | Bot speaks offline ✓</span>
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
