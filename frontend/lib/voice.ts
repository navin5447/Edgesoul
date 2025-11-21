/**
 * Voice Utilities - Speech Recognition & Text-to-Speech
 * Handles voice input/output with gender-adaptive voices
 */

export interface VoiceSettings {
  enabled: boolean;
  speed: number; // 0.5 to 2.0
  pitch: number; // 0.0 to 2.0
  gender: 'male' | 'female' | 'other' | 'not_set';
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

// Check if browser supports speech recognition
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
};

// Check if browser supports text-to-speech
export const isTextToSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

/**
 * Speech Recognition Class - Converts voice to text
 */
export class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Stop after one phrase
      this.recognition.interimResults = true; // Show interim results
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      
      // IMPORTANT: Chrome's speech recognition requires internet
      // There's no way to make it fully offline, it uses Google's servers

      this.setupEventHandlers();
    }
  }

  private setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      const confidence = result[0].confidence || 0;

      if (this.onResultCallback) {
        this.onResultCallback({ transcript, isFinal, confidence });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please enable it in browser settings.';
          break;
        case 'network':
          errorMessage = '⚠️ Voice input needs internet connection (Chrome uses Google servers). Please connect to internet or type your message instead.';
          break;
        case 'service-not-allowed':
          errorMessage = '⚠️ Speech recognition requires internet. Please connect to network or type your message.';
          break;
        default:
          errorMessage = `Speech error: ${event.error}. Try typing instead.`;
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  public start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser');
      return false;
    }

    if (this.isListening) {
      return false;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      if (onError) onError('Failed to start microphone');
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public isActive(): boolean {
    return this.isListening;
  }
}

/**
 * Text-to-Speech Manager - Converts text to voice
 */
export class TextToSpeechManager {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;

    const loadVoiceList = () => {
      this.voices = this.synthesis!.getVoices();
    };

    loadVoiceList();

    // Chrome loads voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoiceList;
    }
  }

  private selectVoice(gender: string): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;

    // Gender-specific voice selection
    let voiceName = '';
    
    if (gender === 'male') {
      // Prefer male voices
      voiceName = this.voices.find(v => 
        v.name.toLowerCase().includes('male') && 
        !v.name.toLowerCase().includes('female')
      )?.name || '';
      
      if (!voiceName) {
        // Fallback to deep voices
        voiceName = this.voices.find(v => 
          v.name.includes('David') || 
          v.name.includes('Daniel') ||
          v.name.includes('UK English Male')
        )?.name || '';
      }
    } else if (gender === 'female') {
      // Prefer female voices
      voiceName = this.voices.find(v => 
        v.name.toLowerCase().includes('female')
      )?.name || '';
      
      if (!voiceName) {
        // Fallback to common female voice names
        voiceName = this.voices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Victoria') ||
          v.name.includes('Zira') ||
          v.name.includes('UK English Female')
        )?.name || '';
      }
    }

    // Find the selected voice or return first English voice
    const voice = this.voices.find(v => v.name === voiceName) || 
                  this.voices.find(v => v.lang.startsWith('en-')) ||
                  this.voices[0];

    return voice;
  }

  public speak(
    text: string, 
    settings: VoiceSettings,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.synthesis) {
      if (onError) onError('Text-to-speech not supported');
      return false;
    }

    if (this.isSpeaking) {
      this.stop();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select voice based on gender
      const voice = this.selectVoice(settings.gender);
      if (voice) {
        utterance.voice = voice;
      }

      // Apply gender-specific settings
      if (settings.gender === 'male') {
        utterance.pitch = Math.max(0.8, settings.pitch * 0.9); // Deeper voice
        utterance.rate = settings.speed;
      } else if (settings.gender === 'female') {
        utterance.pitch = Math.min(1.3, settings.pitch * 1.1); // Higher voice
        utterance.rate = settings.speed * 1.05; // Slightly faster
      } else {
        utterance.pitch = settings.pitch;
        utterance.rate = settings.speed;
      }

      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.isSpeaking = false;
        if (onError) onError(`Speech error: ${event.error}`);
      };

      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Failed to speak:', error);
      if (onError) onError('Failed to speak text');
      return false;
    }
  }

  public stop() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public isActive(): boolean {
    return this.isSpeaking;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// Singleton instances
let speechRecognitionManager: SpeechRecognitionManager | null = null;
let textToSpeechManager: TextToSpeechManager | null = null;

export const getSpeechRecognition = (): SpeechRecognitionManager => {
  if (!speechRecognitionManager) {
    speechRecognitionManager = new SpeechRecognitionManager();
  }
  return speechRecognitionManager;
};

export const getTextToSpeech = (): TextToSpeechManager => {
  if (!textToSpeechManager) {
    textToSpeechManager = new TextToSpeechManager();
  }
  return textToSpeechManager;
};
