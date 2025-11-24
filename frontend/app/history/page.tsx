'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocalAuth } from '@/context/LocalAuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaHistory, FaSpinner, FaCalendar, FaSmile, FaFrown, FaAngry, FaSurprise, FaHeart, FaMeh } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { getAllChatHistory } from '@/lib/offline/chatStorage';

interface ChatMessage {
  id: string;
  userId: string;
  userMessage: string;
  aiResponse: string;
  emotion: string;
  timestamp: any;
}

interface ConversationGroup {
  date: string;
  messages: ChatMessage[];
}

export default function HistoryPage() {
  const { user } = useLocalAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ChatMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const fetchChatHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get chat history from IndexedDB
      const history = await getAllChatHistory(user.id);
      
      // Convert to ChatMessage format
      const messages: ChatMessage[] = history.map((chat: any) => ({
        id: chat.id.toString(),
        userId: user.id,
        userMessage: chat.userMessage,
        aiResponse: chat.aiResponse,
        emotion: chat.emotion || 'neutral',
        timestamp: chat.timestamp
      }));

      // Apply filter
      const filteredMessages = filterMessagesByDate(messages, filter);

      // Group by date
      const grouped = groupByDate(filteredMessages);
      setConversations(grouped);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user, filter, fetchChatHistory]);

  const filterMessagesByDate = (messages: ChatMessage[], filterType: string): ChatMessage[] => {
    if (filterType === 'all') return messages;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return messages.filter((msg) => {
      const msgDate = new Date(msg.timestamp);

      switch (filterType) {
        case 'today':
          return msgDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return msgDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return msgDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const groupByDate = (messages: ChatMessage[]): ConversationGroup[] => {
    const groups: { [key: string]: ChatMessage[] } = {};

    messages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };

  const getEmotionIcon = (emotion: string) => {
    const icons: { [key: string]: any } = {
      joy: <FaSmile className="text-yellow-500" />,
      sadness: <FaFrown className="text-blue-500" />,
      anger: <FaAngry className="text-red-500" />,
      fear: <FaSurprise className="text-purple-500" />,
      surprise: <FaSurprise className="text-orange-500" />,
      love: <FaHeart className="text-pink-500" />,
      neutral: <FaMeh className="text-gray-500" />
    };
    return icons[emotion.toLowerCase()] || icons.neutral;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      joy: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      sadness: 'bg-blue-100 text-blue-800 border-blue-300',
      anger: 'bg-red-100 text-red-800 border-red-300',
      fear: 'bg-purple-100 text-purple-800 border-purple-300',
      surprise: 'bg-orange-100 text-orange-800 border-orange-300',
      love: 'bg-pink-100 text-pink-800 border-pink-300',
      neutral: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[emotion.toLowerCase()] || colors.neutral;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading chat history...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <FaHistory className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Chat History</h1>
                  <p className="text-gray-600">View your past conversations and emotions</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(['all', 'today', 'week', 'month'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations */}
          {conversations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-6">Start chatting with EdgeSoul to see your history here!</p>
              <button
                onClick={() => router.push('/chat')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Start Chatting
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {conversations.map((group, groupIdx) => (
                <div key={groupIdx} className="bg-white rounded-lg shadow-lg p-6">
                  {/* Date Header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <FaCalendar className="text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-800">{group.date}</h2>
                    <span className="ml-auto text-sm text-gray-500">{group.messages.length} messages</span>
                  </div>

                  {/* Messages */}
                  <div className="space-y-4">
                    {group.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedConversation(msg)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getEmotionColor(msg.emotion)}`}>
                              {getEmotionIcon(msg.emotion)}
                              {msg.emotion}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-purple-600 mt-1">You:</span>
                            <p className="text-sm text-gray-800 flex-1">{msg.userMessage}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-blue-600 mt-1">AI:</span>
                            <p className="text-sm text-gray-600 flex-1 line-clamp-2">{msg.aiResponse}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Detail Modal */}
        {selectedConversation && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedConversation(null)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Conversation Detail</h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getEmotionColor(selectedConversation.emotion)}`}>
                    {getEmotionIcon(selectedConversation.emotion)}
                    {selectedConversation.emotion}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedConversation.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 mb-2">Your Message</p>
                  <p className="text-gray-800">{selectedConversation.userMessage}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 mb-2">AI Response</p>
                  <p className="text-gray-800">{selectedConversation.aiResponse}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
