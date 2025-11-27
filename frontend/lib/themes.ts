/**
 * Gender-based theme configuration for EdgeSoul
 * Provides complete UI customization based on user's gender preference
 */

export type GenderType = 'male' | 'female' | 'other' | 'not_set';

export interface ThemeConfig {
  // Colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  gradient: string;
  
  // Typography
  fontFamily: string;
  fontWeight: {
    normal: number;
    medium: number;
    bold: number;
  };
  
  // Spacing & Layout
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Shadows
  shadow: string;
  shadowHover: string;
  
  // Chat bubbles
  chatBubble: {
    user: string;
    assistant: string;
    borderRadius: string;
  };
  
  // Emotion colors
  emotions: {
    joy: string;
    sadness: string;
    anger: string;
    fear: string;
    surprise: string;
    neutral: string;
  };
}

export const themes: Record<GenderType, ThemeConfig> = {
  male: {
    // Colors - Calm Professional Blue (Muted & Easy on Eyes)
    primary: '#5B7AB8',      // More muted blue
    primaryLight: '#8A9DC4', // Softer light blue
    primaryDark: '#3E5A85',  // Deeper muted blue
    secondary: '#6D7E9F',    // More muted slate blue
    accent: '#7A9DC4',       // Calmer sky blue
    background: '#F0F2F5',   // Less bright off-white
    backgroundSecondary: '#DDE3EB', // Softer blue-gray
    gradient: 'linear-gradient(135deg, #E5EDF3 0%, #D8E3EE 100%)', // More subtle gradient
    
    // Typography - Clean & readable
    fontFamily: '"Inter", "Poppins", system-ui, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    
    // Spacing - Soft, rounded (modern)
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
    },
    
    // Shadows - Very soft, minimal
    shadow: '0 2px 8px rgba(91, 122, 184, 0.08), 0 1px 3px rgba(91, 122, 184, 0.05)',
    shadowHover: '0 4px 16px rgba(91, 122, 184, 0.12), 0 2px 6px rgba(91, 122, 184, 0.08)',
    
    // Chat bubbles - Soft rounded
    chatBubble: {
      user: '#5B7AB8',
      assistant: '#F8F9FA',
      borderRadius: '16px',
    },
    
    // Emotions - Very soft, muted tones
    emotions: {
      joy: '#7AC49D',       // Muted mint green
      sadness: '#5B7AB8',   // Muted blue
      anger: '#D19090',     // Muted coral
      fear: '#A094C0',      // Muted lavender
      surprise: '#E0C86E',  // Muted yellow
      neutral: '#9EAFC2',   // Muted gray-blue
    },
  },
  
  female: {
    // Colors - Muted Pink/Lavender (Gentle & Elegant)
    primary: '#D090B8',      // More muted rose pink
    primaryLight: '#E0B5D4', // Softer pastel pink
    primaryDark: '#B87098',  // Deeper muted pink
    secondary: '#B594C4',    // Muted lavender
    accent: '#E0C86E',       // Softer warm yellow
    background: '#F5F0F2',   // Less bright off-white
    backgroundSecondary: '#EDE3EB', // Softer pink-white
    gradient: 'linear-gradient(135deg, #F5E8F0 0%, #E8D8E5 100%)', // More subtle gradient
    
    // Typography - Elegant, softer
    fontFamily: '"Inter", "Poppins", system-ui, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    
    // Spacing - Rounded, soft
    borderRadius: {
      sm: '8px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
    
    // Shadows - Very soft, minimal
    shadow: '0 2px 8px rgba(208, 144, 184, 0.08), 0 1px 3px rgba(208, 144, 184, 0.05)',
    shadowHover: '0 4px 16px rgba(208, 144, 184, 0.12), 0 2px 6px rgba(208, 144, 184, 0.08)',
    
    // Chat bubbles - Extra soft, rounded
    chatBubble: {
      user: '#D090B8',        // Muted rose pink
      assistant: '#FAF7F8',    // Soft off-white
      borderRadius: '20px',    // Extra rounded for softness
    },
    
    // Emotions - Muted Pink/Lavender tones
    emotions: {
      joy: '#E0C86E',         // Muted warm yellow
      sadness: '#94B4D4',     // Muted sky blue
      anger: '#D19090',       // Muted coral
      fear: '#B594C4',        // Muted lavender
      surprise: '#7AC49D',    // Muted mint
      neutral: '#C8B4C8',     // Muted mauve
    },
  },
  
  other: {
    // Colors - Muted Purple/Neutral (Inclusive & Calming)
    primary: '#8878A8',      // More muted purple
    primaryLight: '#A894B8', // Softer lavender
    primaryDark: '#685888',  // Deeper muted purple
    secondary: '#94A4B3',    // Softer gray-blue
    accent: '#7AC49D',       // Muted mint
    background: '#F2F0F5',   // Less bright gray-white
    backgroundSecondary: '#E3DFE8', // Softer purple-white
    gradient: 'linear-gradient(135deg, #E8E0F0 0%, #D8D0E5 100%)', // More subtle gradient
    
    // Typography - Balanced
    fontFamily: '"Inter", "Poppins", system-ui, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    
    // Spacing - Medium rounded
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    
    // Shadows - Very soft, minimal
    shadow: '0 2px 8px rgba(136, 120, 168, 0.08), 0 1px 3px rgba(136, 120, 168, 0.05)',
    shadowHover: '0 4px 16px rgba(136, 120, 168, 0.12), 0 2px 6px rgba(136, 120, 168, 0.08)',
    
    // Chat bubbles - Medium rounded
    chatBubble: {
      user: '#8878A8',
      assistant: '#F8F7FA',
      borderRadius: '16px',
    },
    
    // Emotions - Muted balanced tones
    emotions: {
      joy: '#7AC49D',      // Muted mint
      sadness: '#88A4C2',  // Muted blue-gray
      anger: '#D19090',    // Muted coral
      fear: '#A894B8',     // Muted lavender
      surprise: '#E0C86E', // Muted yellow
      neutral: '#9EAFC2',  // Muted neutral
    },
  },
  
  not_set: {
    // Default theme - Muted Blue (same style as male)
    primary: '#5B7AB8',
    primaryLight: '#8A9DC4',
    primaryDark: '#3E5A85',
    secondary: '#6D7E9F',
    accent: '#7A9DC4',
    background: '#F0F2F5',
    backgroundSecondary: '#DDE3EB',
    gradient: 'linear-gradient(135deg, #E5EDF3 0%, #D8E3EE 100%)',
    fontFamily: '"Inter", "Poppins", system-ui, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
    },
    shadow: '0 2px 8px rgba(91, 122, 184, 0.08), 0 1px 3px rgba(91, 122, 184, 0.05)',
    shadowHover: '0 4px 16px rgba(91, 122, 184, 0.12), 0 2px 6px rgba(91, 122, 184, 0.08)',
    chatBubble: {
      user: '#5B7AB8',
      assistant: '#F8F9FA',
      borderRadius: '16px',
    },
    emotions: {
      joy: '#7AC49D',
      sadness: '#5B7AB8',
      anger: '#D19090',
      fear: '#A094C0',
      surprise: '#E0C86E',
      neutral: '#9EAFC2',
    },
  },
};

/**
 * Get theme based on gender preference
 */
export function getTheme(gender: GenderType = 'not_set'): ThemeConfig {
  return themes[gender] || themes.not_set;
}

/**
 * Generate CSS variables from theme
 */
export function getThemeVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': theme.primary,
    '--color-primary-light': theme.primaryLight,
    '--color-primary-dark': theme.primaryDark,
    '--color-secondary': theme.secondary,
    '--color-accent': theme.accent,
    '--color-background': theme.background,
    '--color-background-secondary': theme.backgroundSecondary,
    '--gradient-primary': theme.gradient,
    '--font-family': theme.fontFamily,
    '--font-weight-normal': theme.fontWeight.normal.toString(),
    '--font-weight-medium': theme.fontWeight.medium.toString(),
    '--font-weight-bold': theme.fontWeight.bold.toString(),
    '--border-radius-sm': theme.borderRadius.sm,
    '--border-radius-md': theme.borderRadius.md,
    '--border-radius-lg': theme.borderRadius.lg,
    '--border-radius-xl': theme.borderRadius.xl,
    '--shadow': theme.shadow,
    '--shadow-hover': theme.shadowHover,
    '--chat-bubble-user': theme.chatBubble.user,
    '--chat-bubble-assistant': theme.chatBubble.assistant,
    '--chat-bubble-radius': theme.chatBubble.borderRadius,
    '--emotion-joy': theme.emotions.joy,
    '--emotion-sadness': theme.emotions.sadness,
    '--emotion-anger': theme.emotions.anger,
    '--emotion-fear': theme.emotions.fear,
    '--emotion-surprise': theme.emotions.surprise,
    '--emotion-neutral': theme.emotions.neutral,
  };
}
