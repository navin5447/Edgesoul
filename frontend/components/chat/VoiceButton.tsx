"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { getSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/voice';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export default function VoiceButton({ 
  onTranscript, 
  disabled = false,
  theme = 'dark',
  className = ''
}: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  const handleVoiceInput = () => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      // Stop listening
      const recognition = getSpeechRecognition();
      recognition.stop();
      setIsListening(false);
      setInterimText('');
      return;
    }

    // Start listening
    setError('');
    setInterimText('');
    
    const recognition = getSpeechRecognition();
    const success = recognition.start(
      (result) => {
        if (result.isFinal) {
          // Final result - send to parent
          onTranscript(result.transcript);
          setInterimText('');
          setIsListening(false);
        } else {
          // Interim result - show what's being said
          setInterimText(result.transcript);
        }
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);
        setInterimText('');
        
        // Auto-clear error after 3 seconds
        setTimeout(() => setError(''), 3000);
      },
      () => {
        // On end
        setIsListening(false);
        setInterimText('');
      }
    );

    if (success) {
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleVoiceInput}
        disabled={disabled}
        className={`
          relative rounded-xl p-2.5 transition-all duration-300
          ${className}
        `}
        style={{
          background: isListening
            ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
            : disabled
              ? 'rgba(168, 207, 251, 0.3)'
              : 'rgba(255, 255, 255, 0.6)',
          color: isListening ? 'white' : '#64748b',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: isListening 
            ? '0 4px 14px rgba(239, 68, 68, 0.4)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isListening) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isListening) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        title={isListening ? 'Click to stop recording' : 'Speak your message (requires internet for speech recognition)'}
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        
        {/* Recording indicator */}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Interim transcript tooltip */}
      {isListening && interimText && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg text-sm whitespace-nowrap backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            color: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-75"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-150"></span>
            </div>
            <span>{interimText}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg text-xs max-w-xs text-center z-50 backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
            color: '#DC2626',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
