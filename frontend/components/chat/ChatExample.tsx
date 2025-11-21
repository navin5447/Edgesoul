'use client';

/**
 * MODERN CHATGPT-STYLE UI - EXAMPLE INTEGRATION
 * 
 * This is a standalone example showing how to use the modern chat UI.
 * Copy this pattern to integrate the chat into your own components.
 */

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import MessageList from './MessageList';
import { Message } from '@/lib/types/chat';
import { Theme } from '@/hooks/useTheme';

interface ChatExampleProps {
  theme?: Theme;
}

export default function ChatExample({ theme = 'dark' }: ChatExampleProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to EdgeSoul! I\'m here to help you with emotion-aware conversations.',
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there! 👋 How can I assist you today?',
      timestamp: new Date(Date.now() - 50000),
      emotion: {
        primary: 'joy',
        confidence: 0.92,
        all: {}
      }
    },
    {
      id: '3',
      role: 'user',
      content: 'I\'d like to know more about how the emotion detection works.',
      timestamp: new Date(Date.now() - 40000),
    },
    {
      id: '4',
      role: 'assistant',
      content: `Great question! Our emotion detection system uses state-of-the-art AI to analyze:

• **Text sentiment** - Understanding the emotional tone of your words
• **Context awareness** - Considering the conversation history
• **Real-time processing** - Instant emotion recognition

The system can detect 7 core emotions:
1. Joy 😊
2. Sadness 😢
3. Anger 😡
4. Fear 😱
5. Surprise 😲
6. Love ❤️
7. Neutral 😐

Each message is analyzed and I adapt my responses based on your emotional state!`,
      timestamp: new Date(Date.now() - 30000),
      emotion: {
        primary: 'neutral',
        confidence: 0.85,
        all: {}
      }
    },
    {
      id: '5',
      role: 'user',
      content: 'That sounds amazing! Can it handle long conversations?',
      timestamp: new Date(Date.now() - 10000),
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thanks for your message! I received: "${userMessage.content}"\n\nThis is a demo response showing how the chat UI handles various features:\n\n• ✅ Smooth animations\n• ✅ Auto-scrolling\n• ✅ Typing indicators\n• ✅ Emotion detection\n• ✅ Long message support\n• ✅ Markdown rendering\n\nTry sending another message to see the animations!`,
        timestamp: new Date(),
        emotion: {
          primary: 'joy',
          confidence: 0.88,
          all: {}
        }
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className={`flex h-screen flex-col ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950'
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b backdrop-blur-sm ${
        theme === 'dark'
          ? 'border-gray-800 bg-gray-900/80'
          : 'border-gray-200 bg-white/80'
      }`}>
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <h1 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Modern ChatGPT-Style UI
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Example integration with animations
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isTyping={isTyping}
          theme={theme}
        />
      </div>

      {/* Input Area */}
      <div className={`border-t backdrop-blur-sm ${
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
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type your message..."
                className={`flex-1 resize-none bg-transparent px-4 py-4 outline-none ${
                  theme === 'dark'
                    ? 'text-white placeholder-gray-500'
                    : 'text-gray-900 placeholder-gray-400'
                }`}
                rows={1}
                style={{ maxHeight: '200px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`m-2 rounded-xl p-2.5 transition-all ${
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
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
