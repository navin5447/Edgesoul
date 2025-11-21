'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function GenderSelectionPage() {
  const router = useRouter();
  const { setGender } = useTheme();
  const [selected, setSelected] = useState<'male' | 'female' | 'other' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user already set gender
    const userId = localStorage.getItem('edgesoul_user_id') || 'user_001';
    
    fetch(`http://localhost:8000/api/v1/memory/profile/${userId}`)
      .then(res => res.json())
      .then(profile => {
        // If gender already set, redirect to dashboard
        if (profile.gender && profile.gender !== 'not_set') {
          router.push('/dashboard');
        }
      })
      .catch(err => {
        console.error('Error checking profile:', err);
      });
  }, [router]);

  const handleContinue = async () => {
    if (!selected) {
      setError('Please select an option to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('edgesoul_user_id') || 'user_001';

      // Update profile with gender
      const response = await fetch(`http://localhost:8000/api/v1/memory/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gender: selected,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update theme immediately
      setGender(selected);

      // Save to localStorage for quick access
      localStorage.setItem('edgesoul_gender', selected);

      console.log('Gender updated:', selected);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error updating gender:', err);
      setError('Failed to save your preference. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to EdgeSoul! 👋</h1>
          <p className="text-xl text-purple-300">Help us personalize your experience</p>
        </div>

        {/* Gender Selection Cards */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            How would you like me to interact with you?
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Male Option */}
            <button
              onClick={() => setSelected('male')}
              className={`
                p-8 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                ${
                  selected === 'male'
                    ? 'bg-blue-600/30 border-blue-500 shadow-lg shadow-blue-500/50'
                    : 'bg-white/5 border-white/20 hover:border-blue-400/50'
                }
              `}
            >
              <div className="text-6xl mb-4">👨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Male</h3>
              <p className="text-sm text-purple-200">
                Direct, solution-focused communication
              </p>
            </button>

            {/* Female Option */}
            <button
              onClick={() => setSelected('female')}
              className={`
                p-8 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                ${
                  selected === 'female'
                    ? 'bg-pink-600/30 border-pink-500 shadow-lg shadow-pink-500/50'
                    : 'bg-white/5 border-white/20 hover:border-pink-400/50'
                }
              `}
            >
              <div className="text-6xl mb-4">👩</div>
              <h3 className="text-xl font-semibold text-white mb-2">Female</h3>
              <p className="text-sm text-purple-200">
                Warm, empathetic, caring responses
              </p>
            </button>

            {/* Other Option */}
            <button
              onClick={() => setSelected('other')}
              className={`
                p-8 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                ${
                  selected === 'other'
                    ? 'bg-green-600/30 border-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-white/5 border-white/20 hover:border-green-400/50'
                }
              `}
            >
              <div className="text-6xl mb-4">⚧️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Other</h3>
              <p className="text-sm text-purple-200">
                Balanced, inclusive interaction
              </p>
            </button>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className={`
              w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
              ${
                selected && !loading
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Continue to Dashboard →'
            )}
          </button>

          {/* Privacy Note */}
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="flex items-start gap-3 text-green-200 text-sm">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold mb-1">Your privacy is protected</p>
                <p className="text-xs">
                  This preference is stored locally on your device only. You can change it anytime in settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skip Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}
