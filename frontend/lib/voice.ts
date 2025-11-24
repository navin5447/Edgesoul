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

    console.log('Selecting voice for gender:', gender);
    console.log('Available voices:', this.voices.map(v => v.name));

    // Gender-specific voice selection with priority order
    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    if (gender === 'female') {
      // Priority 1: Explicit female voices
      selectedVoice = this.voices.find(v => 
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman')
      ) || null;
      
      // Priority 2: Common female voice names
      if (!selectedVoice) {
        const femaleNames = [
          'samantha', 'victoria', 'zira', 'susan', 'hazel',
          'karen', 'serena', 'moira', 'tessa', 'fiona',
          'heather', 'allison', 'princess', 'veena', 'amelie'
        ];
        
        selectedVoice = this.voices.find(v => 
          femaleNames.some(name => v.name.toLowerCase().includes(name))
        ) || null;
      }
      
      // Priority 3: Google UK English Female or Microsoft voices
      if (!selectedVoice) {
        selectedVoice = this.voices.find(v => 
          v.name.includes('Google UK English Female') ||
          v.name.includes('Microsoft Zira') ||
          v.name.includes('Microsoft Susan')
        ) || null;
      }
      
      // Priority 4: Any voice with higher pitch characteristics (index > half)
      if (!selectedVoice && this.voices.length > 1) {
        const midpoint = Math.floor(this.voices.length / 2);
        selectedVoice = this.voices[midpoint];
      }
      
    } else if (gender === 'male') {
      // Priority 1: Explicit male voices
      selectedVoice = this.voices.find(v => 
        v.name.toLowerCase().includes('male') && 
        !v.name.toLowerCase().includes('female')
      ) || null;
      
      // Priority 2: Common male voice names
      if (!selectedVoice) {
        const maleNames = [
          'david', 'daniel', 'alex', 'mark', 'ryan',
          'george', 'nathan', 'oliver', 'thomas', 'james'
        ];
        
        selectedVoice = this.voices.find(v => 
          maleNames.some(name => v.name.toLowerCase().includes(name))
        ) || null;
      }
      
      // Priority 3: Google UK English Male or Microsoft voices
      if (!selectedVoice) {
        selectedVoice = this.voices.find(v => 
          v.name.includes('Google UK English Male') ||
          v.name.includes('Microsoft David') ||
          v.name.includes('Microsoft Mark')
        ) || null;
      }
    }

    // Fallback: First English voice or first available voice
    if (!selectedVoice) {
      selectedVoice = this.voices.find(v => v.lang.startsWith('en-')) || this.voices[0];
    }

    console.log('Selected voice:', selectedVoice?.name);
    return selectedVoice;
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

      // Apply gender-specific settings with enhanced pitch adjustment
      if (settings.gender === 'female') {
        utterance.pitch = Math.min(1.5, settings.pitch * 1.3); // Much higher pitch for feminine voice
        utterance.rate = settings.speed * 1.1; // Slightly faster
      } else if (settings.gender === 'male') {
        utterance.pitch = Math.max(0.7, settings.pitch * 0.85); // Deeper voice
        utterance.rate = settings.speed;
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
