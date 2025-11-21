'use client';

import { useState, useEffect } from 'react';
import { useLocalAuth } from '@/context/LocalAuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FaChartLine, FaSpinner, FaSmile, FaCalendarAlt, FaClock, FaFire } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { getAllChatHistory } from '@/lib/offline/chatStorage';

interface EmotionStats {
  emotion: string;
  count: number;
  percentage: number;
  color: string;
}

interface UserStats {
  totalConversations: number;
  totalMessages: number;
  mostCommonEmotion: string;
  averageSessionLength: number;
  streakDays: number;
  emotionsDetected: number;
}

interface EmotionPattern {
  emotion: string;
  frequency: number;
  intensity: number;
  triggers: string[];
  time_patterns: string[];
}

export default function AnalyticsPage() {
  const { user } = useLocalAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [emotionDistribution, setEmotionDistribution] = useState<EmotionStats[]>([]);
  const [emotionPatterns, setEmotionPatterns] = useState<EmotionPattern[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch data from IndexedDB
      const chats = await getAllChatHistory(user.id);
      
      const emotionCounts: { [key: string]: number } = {};
      let totalMessages = 0;
      const timestamps: Date[] = [];

      chats.forEach((chat) => {
        const emotion = chat.emotion || 'neutral';
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        totalMessages++;
        timestamps.push(new Date(chat.timestamp));
      });

      // Calculate statistics
      const conversationCount = totalMessages;
      const uniqueEmotions = Object.keys(emotionCounts).length;
      const mostCommon = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
      
      // Calculate streak days
      const streakDays = calculateStreakDays(timestamps);
      
      setUserStats({
        totalConversations: conversationCount,
        totalMessages: totalMessages,
        mostCommonEmotion: mostCommon ? mostCommon[0] : 'neutral',
        averageSessionLength: conversationCount > 0 ? Math.round(totalMessages / conversationCount) : 0,
        streakDays: streakDays,
        emotionsDetected: uniqueEmotions
      });

      // Create emotion patterns from Firebase data
      const patterns: EmotionPattern[] = Object.entries(emotionCounts).map(([emotion, count]) => ({
        emotion,
        frequency: count,
        intensity: 70, // Default intensity
        triggers: [],
        time_patterns: []
      }));
      
      setEmotionPatterns(patterns);

      // Calculate emotion distribution
      const distribution = calculateEmotionDistribution(patterns);
      setEmotionDistribution(distribution);

      // Try to fetch additional data from backend (if available)
      try {
        const statsResponse = await fetch(`http://localhost:8000/api/v1/memory/stats/${user.id}`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          // Merge backend data if available
          setUserStats(prev => prev ? ({
            ...prev,
            averageSessionLength: stats.average_session_length || prev.averageSessionLength,
            streakDays: stats.streak_days || prev.streakDays
          }) : null);
        }

        const patternsResponse = await fetch(`http://localhost:8000/api/v1/memory/emotions/${user.id}/patterns`);
        if (patternsResponse.ok) {
          const backendPatterns = await patternsResponse.json();
          if (backendPatterns.length > 0) {
            setEmotionPatterns(backendPatterns);
            const backendDistribution = calculateEmotionDistribution(backendPatterns);
            setEmotionDistribution(backendDistribution);
          }
        }
      } catch (apiError) {
        console.log('Backend API not available, using IndexedDB data only');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreakDays = (timestamps: Date[]): number => {
    if (timestamps.length === 0) return 0;
    
    // Sort timestamps
    const sortedDates = timestamps
      .map(t => t.toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // unique dates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toDateString();
    
    // Check if most recent is today or yesterday
    const mostRecent = new Date(sortedDates[0]);
    const daysDiff = Math.floor((new Date().getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // Streak broken
    
    // Count consecutive days
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const curr = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      const diff = Math.floor((curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateEmotionDistribution = (patterns: EmotionPattern[]): EmotionStats[] => {
    const total = patterns.reduce((sum, p) => sum + p.frequency, 0);
    
    const emotionColors: { [key: string]: string } = {
      joy: '#FCD34D',
      sadness: '#60A5FA',
      anger: '#F87171',
      fear: '#A78BFA',
      surprise: '#FB923C',
      love: '#F472B6',
      neutral: '#9CA3AF'
    };

    return patterns.map(pattern => ({
      emotion: pattern.emotion,
      count: pattern.frequency,
      percentage: total > 0 ? (pattern.frequency / total) * 100 : 0,
      color: emotionColors[pattern.emotion.toLowerCase()] || emotionColors.neutral
    })).sort((a, b) => b.count - a.count);
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: { [key: string]: string } = {
      joy: '😊',
      sadness: '😢',
      anger: '😡',
      fear: '😱',
      surprise: '😲',
      love: '❤️',
      neutral: '😐'
    };
    return emojis[emotion.toLowerCase()] || '😐';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
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
                  <FaChartLine className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Emotion Analytics</h1>
                  <p className="text-gray-600">Track your emotional patterns and insights</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Time Range Filter */}
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'week' ? 'Last Week' : range === 'month' ? 'Last Month' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              icon={<FaSmile className="text-2xl" />}
              title="Total Conversations"
              value={userStats?.totalConversations || 0}
              color="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<FaChartLine className="text-2xl" />}
              title="Emotions Detected"
              value={userStats?.emotionsDetected || 0}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<FaClock className="text-2xl" />}
              title="Avg Session (min)"
              value={Math.round(userStats?.averageSessionLength || 0)}
              color="from-orange-500 to-yellow-500"
            />
            <StatCard
              icon={<FaFire className="text-2xl" />}
              title="Streak Days"
              value={userStats?.streakDays || 0}
              color="from-red-500 to-pink-500"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emotion Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Emotion Distribution</h2>
              
              {emotionDistribution.length === 0 ? (
                <div className="text-center py-12">
                  <FaSmile className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No emotion data yet</p>
                  <p className="text-sm text-gray-500">Start chatting to see your emotional patterns!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emotionDistribution.map((emotion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEmotionEmoji(emotion.emotion)}</span>
                          <span className="font-semibold text-gray-700 capitalize">{emotion.emotion}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-800">{emotion.percentage.toFixed(1)}%</span>
                          <span className="text-xs text-gray-500 ml-2">({emotion.count})</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${emotion.percentage}%`,
                            backgroundColor: emotion.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most Common Emotion */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Most Common Emotion</h2>
              
              {userStats && userStats.mostCommonEmotion ? (
                <div className="text-center py-8">
                  <div className="text-8xl mb-4">
                    {getEmotionEmoji(userStats.mostCommonEmotion)}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 capitalize mb-2">
                    {userStats.mostCommonEmotion}
                  </h3>
                  <p className="text-gray-600">
                    This is the emotion you express most frequently in conversations
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Not enough data yet</p>
                </div>
              )}
            </div>

            {/* Emotion Patterns */}
            <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Emotion Patterns & Triggers</h2>
              
              {emotionPatterns.length === 0 ? (
                <div className="text-center py-12">
                  <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No pattern data available yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emotionPatterns.slice(0, 6).map((pattern, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEmotionEmoji(pattern.emotion)}</span>
                          <span className="font-semibold text-gray-700 capitalize">{pattern.emotion}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Intensity: {Math.round(pattern.intensity)}/100
                        </span>
                      </div>
                      
                      {pattern.triggers && pattern.triggers.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Common Triggers:</p>
                          <div className="flex flex-wrap gap-1">
                            {pattern.triggers.slice(0, 3).map((trigger, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Frequency: {pattern.frequency} times
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: string;
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
