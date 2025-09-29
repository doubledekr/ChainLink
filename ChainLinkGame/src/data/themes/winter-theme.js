/**
 * Winter Wonderland Theme Configuration
 * Magical winter theme with snowflakes and ice crystals
 */

export const winterTheme = {
  id: 'winter_wonderland',
  name: 'Winter Wonderland',
  description: 'A magical winter experience with snowflakes and ice crystals',
  
  colors: {
    // Primary colors
    primary: '#4A90E2',        // Winter blue
    secondary: '#87CEEB',      // Sky blue
    accent: '#E3F2FD',         // Light blue accent
    
    // Background colors
    background: '#F8F9FA',     // Light gray background
    surface: '#FFFFFF',        // White surface
    cardBackground: '#FFFFFF', // Card background
    
    // Text colors
    text: '#2C3E50',           // Dark blue-gray text
    textSecondary: '#7F8C8D',  // Gray secondary text
    textDisabled: '#BDC3C7',   // Light gray disabled text
    
    // Border colors
    border: '#BDC3C7',         // Light gray border
    borderLight: '#E1E8ED',    // Very light border
    borderDark: '#95A5A6',     // Dark border
    
    // Status colors
    success: '#27AE60',        // Green for success
    warning: '#F39C12',        // Orange for warning
    error: '#E74C3C',          // Red for error
    info: '#3498DB',           // Blue for info
    
    // Game-specific colors
    gameBackground: '#F8F9FA',
    gameSurface: '#FFFFFF',
    wordDisplay: '#2C3E50',
    scoreDisplay: '#4A90E2',
    timerDisplay: '#E74C3C',
    streakDisplay: '#F39C12',
    
    // Button colors
    buttonPrimary: '#4A90E2',
    buttonSecondary: '#87CEEB',
    buttonSuccess: '#27AE60',
    buttonWarning: '#F39C12',
    buttonError: '#E74C3C',
    
    // Input colors
    inputBackground: '#FFFFFF',
    inputBorder: '#BDC3C7',
    inputFocus: '#4A90E2',
    
    // Navigation colors
    tabActive: '#4A90E2',
    tabInactive: '#95A5A6',
    
    // Leaderboard colors
    leaderboardHeader: '#4A90E2',
    leaderboardRow: '#FFFFFF',
    leaderboardRowAlt: '#F8F9FA',
    
    // Challenge colors
    challengeProgress: '#4A90E2',
    challengeCompleted: '#27AE60',
    challengeClaimed: '#F39C12'
  },
  
  // Particle effects
  particles: {
    type: 'snowflakes',
    density: 'medium',
    speed: 'slow',
    colors: ['#FFFFFF', '#E3F2FD', '#87CEEB'],
    size: 'small'
  },
  
  // Music theme
  music: {
    theme: 'winter_ambient',
    volume: 0.7,
    fadeIn: 2000,
    fadeOut: 1000
  },
  
  // Visual effects
  effects: {
    blur: false,
    glow: false,
    shadows: true,
    animations: 'smooth',
    transitions: 'gentle'
  },
  
  // Typography
  typography: {
    fontFamily: 'System',
    fontSize: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      bold: '700'
    }
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8
    }
  },
  
  // Animation configurations
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500
    },
    easing: 'ease-in-out'
  },
  
  // Theme-specific assets
  assets: {
    backgroundImage: 'winter-background.png',
    iconSet: 'winter-icons',
    soundEffects: 'winter-sounds',
    particleTexture: 'snowflake.png'
  },
  
  // Accessibility
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false
  }
};

export default winterTheme;
