import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ThemeService - Dynamic theme management system
 * Handles seasonal themes, custom themes, and theme transitions
 */
class ThemeService {
  constructor() {
    this.currentTheme = null;
    this.themes = new Map();
    this.isInitialized = false;
    this.defaultThemes = this.initializeDefaultThemes();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.loadThemes();
      this.currentTheme = await this.getCurrentTheme();
      this.isInitialized = true;
      console.log('ThemeService initialized');
      return true;
    } catch (error) {
      console.error('ThemeService initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize default themes
   */
  initializeDefaultThemes() {
    return {
      default: {
        id: 'default',
        name: 'Default Theme',
        description: 'Clean and simple default theme',
        colors: {
          primary: '#4A90E2',
          secondary: '#87CEEB',
          accent: '#E3F2FD',
          background: '#F8F9FA',
          surface: '#FFFFFF',
          text: '#333333',
          textSecondary: '#666666',
          border: '#E1E5E9',
          success: '#4CAF50',
          warning: '#FFA726',
          error: '#F44336',
          info: '#2196F3'
        },
        particles: 'none',
        music: 'default',
        unlocked: true,
        premium: false
      },
      winter_wonderland: {
        id: 'winter_wonderland',
        name: 'Winter Wonderland',
        description: 'Magical winter theme with snowflakes',
        colors: {
          primary: '#4A90E2',
          secondary: '#87CEEB',
          accent: '#E3F2FD',
          background: '#F8F9FA',
          surface: '#FFFFFF',
          text: '#2C3E50',
          textSecondary: '#7F8C8D',
          border: '#BDC3C7',
          success: '#27AE60',
          warning: '#F39C12',
          error: '#E74C3C',
          info: '#3498DB'
        },
        particles: 'snowflakes',
        music: 'winter_ambient',
        unlocked: true,
        premium: false
      },
      spring_bloom: {
        id: 'spring_bloom',
        name: 'Spring Bloom',
        description: 'Fresh spring theme with flower petals',
        colors: {
          primary: '#4CAF50',
          secondary: '#81C784',
          accent: '#E8F5E8',
          background: '#F1F8E9',
          surface: '#FFFFFF',
          text: '#2E7D32',
          textSecondary: '#689F38',
          border: '#C8E6C9',
          success: '#388E3C',
          warning: '#FF9800',
          error: '#D32F2F',
          info: '#1976D2'
        },
        particles: 'petals',
        music: 'spring_ambient',
        unlocked: true,
        premium: false
      },
      summer_heat: {
        id: 'summer_heat',
        name: 'Summer Heat',
        description: 'Vibrant summer theme with sunshine',
        colors: {
          primary: '#FF6B6B',
          secondary: '#FFB74D',
          accent: '#FFF3E0',
          background: '#FFF8E1',
          surface: '#FFFFFF',
          text: '#D84315',
          textSecondary: '#FF7043',
          border: '#FFCCBC',
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3'
        },
        particles: 'sunshine',
        music: 'summer_ambient',
        unlocked: true,
        premium: false
      },
      autumn_harvest: {
        id: 'autumn_harvest',
        name: 'Autumn Harvest',
        description: 'Warm autumn theme with falling leaves',
        colors: {
          primary: '#FF8C00',
          secondary: '#FFB74D',
          accent: '#FFF3E0',
          background: '#FFF8E1',
          surface: '#FFFFFF',
          text: '#E65100',
          textSecondary: '#FF9800',
          border: '#FFCCBC',
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3'
        },
        particles: 'leaves',
        music: 'autumn_ambient',
        unlocked: true,
        premium: false
      },
      premium_neon: {
        id: 'premium_neon',
        name: 'Neon Nights',
        description: 'Premium neon theme with glowing effects',
        colors: {
          primary: '#00E676',
          secondary: '#FF1744',
          accent: '#1A1A1A',
          background: '#0D1117',
          surface: '#161B22',
          text: '#FFFFFF',
          textSecondary: '#8B949E',
          border: '#30363D',
          success: '#00E676',
          warning: '#FFD700',
          error: '#FF1744',
          info: '#00B0FF'
        },
        particles: 'neon',
        music: 'electronic',
        unlocked: false,
        premium: true
      },
      premium_gold: {
        id: 'premium_gold',
        name: 'Golden Royalty',
        description: 'Premium gold theme for champions',
        colors: {
          primary: '#FFD700',
          secondary: '#FFA726',
          accent: '#FFF8E1',
          background: '#FFFDE7',
          surface: '#FFFFFF',
          text: '#F57F17',
          textSecondary: '#F9A825',
          border: '#FFE082',
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3'
        },
        particles: 'gold',
        music: 'royal',
        unlocked: false,
        premium: true
      }
    };
  }

  /**
   * Get current theme
   */
  async getCurrentTheme() {
    try {
      const storedTheme = await AsyncStorage.getItem('current_theme');
      if (storedTheme) {
        const themeId = JSON.parse(storedTheme);
        return this.getThemeById(themeId) || this.defaultThemes.default;
      }
      return this.defaultThemes.default;
    } catch (error) {
      console.error('Failed to get current theme:', error);
      return this.defaultThemes.default;
    }
  }

  /**
   * Set current theme
   */
  async setCurrentTheme(themeId) {
    try {
      const theme = this.getThemeById(themeId);
      if (!theme) {
        throw new Error(`Theme not found: ${themeId}`);
      }
      
      if (!theme.unlocked) {
        throw new Error(`Theme not unlocked: ${themeId}`);
      }
      
      this.currentTheme = theme;
      await AsyncStorage.setItem('current_theme', JSON.stringify(themeId));
      console.log(`Theme changed to: ${theme.name}`);
      return true;
    } catch (error) {
      console.error('Failed to set current theme:', error);
      return false;
    }
  }

  /**
   * Get theme by ID
   */
  getThemeById(themeId) {
    // Check default themes first
    if (this.defaultThemes[themeId]) {
      return this.defaultThemes[themeId];
    }
    
    // Check custom themes
    if (this.themes.has(themeId)) {
      return this.themes.get(themeId);
    }
    
    return null;
  }

  /**
   * Get all available themes
   */
  getAllThemes() {
    const allThemes = Object.values(this.defaultThemes);
    
    // Add custom themes
    for (const customTheme of this.themes.values()) {
      allThemes.push(customTheme);
    }
    
    return allThemes.sort((a, b) => {
      // Sort by: unlocked first, then by name
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Get unlocked themes
   */
  getUnlockedThemes() {
    return this.getAllThemes().filter(theme => theme.unlocked);
  }

  /**
   * Get premium themes
   */
  getPremiumThemes() {
    return this.getAllThemes().filter(theme => theme.premium);
  }

  /**
   * Unlock theme
   */
  async unlockTheme(themeId) {
    try {
      const theme = this.getThemeById(themeId);
      if (!theme) {
        throw new Error(`Theme not found: ${themeId}`);
      }
      
      if (theme.unlocked) {
        return true; // Already unlocked
      }
      
      // Unlock the theme
      theme.unlocked = true;
      
      // Save to storage
      await this.saveThemes();
      
      console.log(`Theme unlocked: ${theme.name}`);
      return true;
    } catch (error) {
      console.error('Failed to unlock theme:', error);
      return false;
    }
  }

  /**
   * Lock theme (for testing purposes)
   */
  async lockTheme(themeId) {
    try {
      const theme = this.getThemeById(themeId);
      if (!theme || themeId === 'default') {
        return false; // Can't lock default theme
      }
      
      theme.unlocked = false;
      
      // If this theme is currently active, switch to default
      if (this.currentTheme && this.currentTheme.id === themeId) {
        await this.setCurrentTheme('default');
      }
      
      await this.saveThemes();
      console.log(`Theme locked: ${theme.name}`);
      return true;
    } catch (error) {
      console.error('Failed to lock theme:', error);
      return false;
    }
  }

  /**
   * Create custom theme
   */
  async createCustomTheme(themeData) {
    try {
      const themeId = `custom_${Date.now()}`;
      const customTheme = {
        id: themeId,
        name: themeData.name || 'Custom Theme',
        description: themeData.description || 'A custom theme',
        colors: {
          ...this.defaultThemes.default.colors,
          ...themeData.colors
        },
        particles: themeData.particles || 'none',
        music: themeData.music || 'default',
        unlocked: true,
        premium: false,
        custom: true
      };
      
      this.themes.set(themeId, customTheme);
      await this.saveThemes();
      
      console.log(`Custom theme created: ${customTheme.name}`);
      return customTheme;
    } catch (error) {
      console.error('Failed to create custom theme:', error);
      return null;
    }
  }

  /**
   * Delete custom theme
   */
  async deleteCustomTheme(themeId) {
    try {
      const theme = this.getThemeById(themeId);
      if (!theme || !theme.custom) {
        return false; // Can't delete non-custom themes
      }
      
      // If this theme is currently active, switch to default
      if (this.currentTheme && this.currentTheme.id === themeId) {
        await this.setCurrentTheme('default');
      }
      
      this.themes.delete(themeId);
      await this.saveThemes();
      
      console.log(`Custom theme deleted: ${theme.name}`);
      return true;
    } catch (error) {
      console.error('Failed to delete custom theme:', error);
      return false;
    }
  }

  /**
   * Get theme colors for current theme
   */
  getCurrentThemeColors() {
    return this.currentTheme ? this.currentTheme.colors : this.defaultThemes.default.colors;
  }

  /**
   * Get theme particles for current theme
   */
  getCurrentThemeParticles() {
    return this.currentTheme ? this.currentTheme.particles : 'none';
  }

  /**
   * Get theme music for current theme
   */
  getCurrentThemeMusic() {
    return this.currentTheme ? this.currentTheme.music : 'default';
  }

  /**
   * Apply seasonal theme
   */
  async applySeasonalTheme(seasonId) {
    try {
      const seasonalThemeId = seasonId;
      const theme = this.getThemeById(seasonalThemeId);
      
      if (theme && theme.unlocked) {
        await this.setCurrentTheme(seasonalThemeId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to apply seasonal theme:', error);
      return false;
    }
  }

  /**
   * Load themes from storage
   */
  async loadThemes() {
    try {
      const themes = await AsyncStorage.getItem('custom_themes');
      if (themes) {
        const themesData = JSON.parse(themes);
        this.themes = new Map(themesData);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  }

  /**
   * Save themes to storage
   */
  async saveThemes() {
    try {
      const themesArray = Array.from(this.themes.entries());
      await AsyncStorage.setItem('custom_themes', JSON.stringify(themesArray));
    } catch (error) {
      console.error('Failed to save themes:', error);
    }
  }

  /**
   * Reset themes to default
   */
  async resetThemes() {
    try {
      this.themes.clear();
      await AsyncStorage.removeItem('custom_themes');
      await this.setCurrentTheme('default');
      console.log('Themes reset to default');
      return true;
    } catch (error) {
      console.error('Failed to reset themes:', error);
      return false;
    }
  }

  /**
   * Get theme statistics
   */
  async getThemeStats() {
    try {
      const stats = await AsyncStorage.getItem('theme_stats');
      return stats ? JSON.parse(stats) : {
        totalThemes: Object.keys(this.defaultThemes).length,
        unlockedThemes: 1, // Default theme
        customThemes: 0,
        premiumThemes: 0,
        themeChanges: 0
      };
    } catch (error) {
      console.error('Failed to get theme stats:', error);
      return {
        totalThemes: Object.keys(this.defaultThemes).length,
        unlockedThemes: 1,
        customThemes: 0,
        premiumThemes: 0,
        themeChanges: 0
      };
    }
  }

  /**
   * Update theme statistics
   */
  async updateThemeStats(statType, increment = 1) {
    try {
      const stats = await this.getThemeStats();
      if (stats[statType] !== undefined) {
        stats[statType] += increment;
        await AsyncStorage.setItem('theme_stats', JSON.stringify(stats));
      }
    } catch (error) {
      console.error('Failed to update theme stats:', error);
    }
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized() {
    return this.isInitialized;
  }
}

// Export singleton instance
export default new ThemeService();
