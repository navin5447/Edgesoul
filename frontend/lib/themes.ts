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
    // Colors - Blue/Dark masculine tones
    primary: '#1E40AF',
    primaryLight: '#3B82F6',
    primaryDark: '#1E3A8A',
    secondary: '#334155',
    accent: '#0EA5E9',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #334155 100%)',
    
    // Typography - Bold, strong
    fontFamily: '"Roboto", "Inter", system-ui, sans-serif',
    fontWeight: {
      normal: 500,
      medium: 600,
      bold: 700,
    },
    
    // Spacing - Sharp edges
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
    
    // Shadows - Strong, defined
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    
    // Chat bubbles - Angular
    chatBubble: {
      user: '#1E40AF',
      assistant: '#334155',
      borderRadius: '12px',
    },
    
    // Emotions - Cooler tones
    emotions: {
      joy: '#10B981',
      sadness: '#3B82F6',
      anger: '#EF4444',
      fear: '#8B5CF6',
      surprise: '#F59E0B',
      neutral: '#6B7280',
    },
  },
  
  female: {
    // Colors - Pink/Rose feminine palette (warm, inviting, elegant)
    primary: '#EC4899',      // Rose Pink - primary color
    primaryLight: '#F9A8D4',  // Light Pink - softer variant
    primaryDark: '#DB2777',   // Deep Rose - darker variant
    secondary: '#F472B6',     // Bright Pink - secondary accent
    accent: '#FDE047',        // Soft Yellow - complementary accent
    background: '#1F0A28',    // Deep Purple-Black - elegant base
    backgroundSecondary: '#2D1440', // Dark Purple - secondary background
    gradient: 'linear-gradient(135deg, #1F0A28 0%, #2D1440 50%, #EC4899 100%)',
    
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
    
    // Shadows - Soft, gentle
    shadow: '0 4px 6px -1px rgba(236, 72, 153, 0.15), 0 2px 4px -1px rgba(192, 132, 252, 0.1)',
    shadowHover: '0 10px 15px -3px rgba(236, 72, 153, 0.2), 0 4px 6px -2px rgba(192, 132, 252, 0.15)',
    
    // Chat bubbles - Very rounded (soft, feminine)
    chatBubble: {
      user: '#EC4899',        // Rose Pink
      assistant: '#F472B6',    // Bright Pink
      borderRadius: '24px',    // Extra rounded for softness
    },
    
    // Emotions - Pink/Purple warm tones
    emotions: {
      joy: '#F472B6',         // Bright Pink - happiness
      sadness: '#C084FC',     // Lavender - gentle melancholy
      anger: '#FB7185',       // Coral Pink - softened intensity
      fear: '#E879F9',        // Bright Magenta - visible but not harsh
      surprise: '#FDE047',    // Soft Yellow - excitement
      neutral: '#F9A8D4',     // Light Pink - calm
    },
  },
  
  other: {
    // Colors - Green/Neutral inclusive tones
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    secondary: '#6B7280',
    accent: '#14B8A6',
    background: '#F9FAFB',
    backgroundSecondary: '#F3F4F6',
    gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
    
    // Typography - Balanced
    fontFamily: '"Inter", system-ui, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    
    // Spacing - Medium rounded
    borderRadius: {
      sm: '6px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    
    // Shadows - Balanced
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    
    // Chat bubbles - Medium rounded
    chatBubble: {
      user: '#10B981',
      assistant: '#6B7280',
      borderRadius: '16px',
    },
    
    // Emotions - Balanced tones
    emotions: {
      joy: '#10B981',
      sadness: '#3B82F6',
      anger: '#F59E0B',
      fear: '#8B5CF6',
      surprise: '#14B8A6',
      neutral: '#6B7280',
    },
  },
  
  not_set: {
    // Default theme - same as 'other'
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    secondary: '#6B7280',
    accent: '#14B8A6',
    background: '#F9FAFB',
    backgroundSecondary: '#F3F4F6',
    gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
    fontFamily: '"Inter", system-ui, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
    borderRadius: {
      sm: '6px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    chatBubble: {
      user: '#10B981',
      assistant: '#6B7280',
      borderRadius: '16px',
    },
    emotions: {
      joy: '#10B981',
      sadness: '#3B82F6',
      anger: '#F59E0B',
      fear: '#8B5CF6',
      surprise: '#14B8A6',
      neutral: '#6B7280',
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
