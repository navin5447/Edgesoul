'use client';

import { useState, useEffect } from 'react';
import { useLocalAuth } from '@/context/LocalAuthContext';
import { useRouter } from 'next/navigation';
import { FaUser, FaSave, FaSpinner } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';
import DataExportImport from '@/components/DataExportImport';

interface UserProfile {
  user_id: string;
  personality: {
    empathy_level: number;
    humor_level: number;
    formality_level: number;
    verbosity_level: number;
    proactiveness_level: number;
  };
  preferences: Record<string, any>;
  created_at: string;
  last_updated: string;
}

export default function ProfilePage() {
  const { user } = useLocalAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Always create default profile first
      const defaultProfile = {
        user_id: user?.id || '',
        personality: {
          empathy_level: 50,
          humor_level: 50,
          formality_level: 50,
          verbosity_level: 50,
          proactiveness_level: 50,
        },
        preferences: {},
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };
      
      try {
        // Try to fetch from backend
        const response = await fetch(`http://localhost:8000/api/v1/memory/profile/${user?.id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received profile from backend:', data);
          
          // Backend returns flat structure, convert to nested for frontend
          const backendProfile = {
            ...defaultProfile,
            user_id: data.user_id || user?.id || '',
            created_at: data.created_at || defaultProfile.created_at,
            last_updated: data.updated_at || data.last_updated || defaultProfile.last_updated,
            preferences: data.preferences || data.communication_patterns || {},
            personality: {
              empathy_level: data.empathy_level ?? defaultProfile.personality.empathy_level,
              humor_level: data.humor_level ?? defaultProfile.personality.humor_level,
              formality_level: data.formality_level ?? defaultProfile.personality.formality_level,
              verbosity_level: data.verbosity_level ?? defaultProfile.personality.verbosity_level,
              proactiveness_level: data.proactiveness_level ?? defaultProfile.personality.proactiveness_level,
            }
          };
          
          console.log('Converted to frontend format:', backendProfile);
          setProfile(backendProfile);
        } else {
          // Backend not available or profile doesn't exist, use default
          setProfile(defaultProfile);
        }
      } catch (apiError) {
        // Backend not reachable, use default profile
        console.log('Backend not available, using default profile');
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ text: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (key: keyof UserProfile['personality'], value: number) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      personality: {
        ...profile.personality,
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    try {
      setSaving(true);
      setMessage(null);

      const updateData = {
        personality: profile.personality,
        preferences: profile.preferences,
      };
      
      console.log('Saving profile for user:', user.id);
      console.log('Update data being sent:', updateData);

      const response = await fetch(`http://localhost:8000/api/v1/memory/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const savedProfile = await response.json();
        console.log('Profile saved successfully:', savedProfile);
        setMessage({ text: 'Profile saved successfully!', type: 'success' });
        
        // Refresh profile from backend to confirm changes
        await fetchProfile();
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorText = await response.text();
        console.error('Save failed:', errorText);
        throw new Error(`Failed to save profile: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ text: 'Failed to save profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center">
            <p className="text-gray-600">Please log in to view your profile</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
                <p className="text-gray-600">{user.username} ({user.email || 'No email'})</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Profile Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-600">Profile Created:</span>
              <p className="font-medium text-gray-800">
                {profile && new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <p className="font-medium text-gray-800">
                {profile && new Date(profile.last_updated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Personality Settings */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Personality Settings</h2>
          <p className="text-gray-600 mb-6">
            Customize how your AI assistant responds to you. Adjust these sliders to match your preferences.
          </p>

          {profile && profile.personality ? (
            <div className="space-y-6">
              {/* Empathy Level */}
              <PersonalitySlider
                label="Empathy Level"
                description="How emotionally supportive and understanding the responses are"
                value={profile.personality.empathy_level || 50}
                onChange={(value) => handleSliderChange('empathy_level', value)}
                lowLabel="Direct"
                highLabel="Supportive"
              />

              {/* Humor Level */}
              <PersonalitySlider
                label="Humor Level"
                description="How playful and lighthearted the responses are"
                value={profile.personality.humor_level || 50}
                onChange={(value) => handleSliderChange('humor_level', value)}
                lowLabel="Serious"
                highLabel="Playful"
              />

              {/* Formality Level */}
              <PersonalitySlider
                label="Formality Level"
                description="How formal or casual the language style is"
                value={profile.personality.formality_level || 50}
                onChange={(value) => handleSliderChange('formality_level', value)}
                lowLabel="Casual"
                highLabel="Formal"
              />

              {/* Verbosity Level */}
              <PersonalitySlider
                label="Verbosity Level"
                description="How detailed and lengthy the responses are"
                value={profile.personality.verbosity_level || 50}
                onChange={(value) => handleSliderChange('verbosity_level', value)}
                lowLabel="Concise"
                highLabel="Detailed"
              />

              {/* Proactiveness Level */}
              <PersonalitySlider
                label="Proactiveness Level"
                description="How often the assistant offers suggestions and asks questions"
                value={profile.personality.proactiveness_level || 50}
                onChange={(value) => handleSliderChange('proactiveness_level', value)}
                lowLabel="Reactive"
                highLabel="Proactive"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading personality settings...</p>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Data Export/Import Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <DataExportImport />
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

interface PersonalitySliderProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
}

function PersonalitySlider({
  label,
  description,
  value,
  onChange,
  lowLabel,
  highLabel,
}: PersonalitySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <label className="text-lg font-semibold text-gray-800">{label}</label>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <span className="text-2xl font-bold text-purple-600">{value}</span>
      </div>

      <div className="relative pt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(59, 130, 246) ${value}%, rgb(229, 231, 235) ${value}%, rgb(229, 231, 235) 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
