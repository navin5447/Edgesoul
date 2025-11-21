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
          ${isListening
            ? theme === 'dark'
              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
              : 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
            : disabled
              ? theme === 'dark'
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
          }
          ${className}
        `}
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
        <div className={`
          absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
          px-3 py-2 rounded-lg text-sm whitespace-nowrap
          ${theme === 'dark'
            ? 'bg-gray-800 text-gray-200 border border-gray-700'
            : 'bg-white text-gray-800 border border-gray-300 shadow-lg'
          }
        `}>
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
        <div className={`
          absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
          px-3 py-2 rounded-lg text-xs max-w-xs text-center z-50
          ${theme === 'dark'
            ? 'bg-red-900/90 text-red-200 border border-red-700'
            : 'bg-red-100 text-red-800 border border-red-300 shadow-lg'
          }
        `}>
          {error}
        </div>
      )}
    </div>
  );
}
