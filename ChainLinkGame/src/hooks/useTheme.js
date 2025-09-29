import { useState, useEffect, useCallback } from 'react';
import ThemeService from '../services/ThemeService';

/**
 * useTheme - Custom hook for theme management functionality
 */
export const useTheme = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [allThemes, setAllThemes] = useState([]);
  const [unlockedThemes, setUnlockedThemes] = useState([]);
  const [premiumThemes, setPremiumThemes] = useState([]);
  const [themeStats, setThemeStats] = useState(null);

  /**
   * Initialize theme service
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await ThemeService.initialize();
      setIsInitialized(success);
      
      if (success) {
        await loadThemeData();
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      setIsInitialized(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load all theme data
   */
  const loadThemeData = useCallback(async () => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        throw new Error('Theme service not initialized');
      }

      setError(null);
      
      const [
        current,
        all,
        unlocked,
        premium,
        stats
      ] = await Promise.all([
        ThemeService.getCurrentTheme(),
        ThemeService.getAllThemes(),
        ThemeService.getUnlockedThemes(),
        ThemeService.getPremiumThemes(),
        ThemeService.getThemeStats()
      ]);
      
      setCurrentTheme(current);
      setAllThemes(all);
      setUnlockedThemes(unlocked);
      setPremiumThemes(premium);
      setThemeStats(stats);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to load theme data:', err);
    }
  }, []);

  /**
   * Set current theme
   */
  const setCurrentThemeById = useCallback(async (themeId) => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        throw new Error('Theme service not initialized');
      }

      setError(null);
      const success = await ThemeService.setCurrentTheme(themeId);
      
      if (success) {
        // Reload theme data
        await loadThemeData();
        
        // Update theme statistics
        await ThemeService.updateThemeStats('themeChanges', 1);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to set current theme:', err);
      return false;
    }
  }, [loadThemeData]);

  /**
   * Unlock theme
   */
  const unlockTheme = useCallback(async (themeId) => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        throw new Error('Theme service not initialized');
      }

      setError(null);
      const success = await ThemeService.unlockTheme(themeId);
      
      if (success) {
        // Reload theme data
        await loadThemeData();
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to unlock theme:', err);
      return false;
    }
  }, [loadThemeData]);

  /**
   * Create custom theme
   */
  const createCustomTheme = useCallback(async (themeData) => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        throw new Error('Theme service not initialized');
      }

      setError(null);
      const customTheme = await ThemeService.createCustomTheme(themeData);
      
      if (customTheme) {
        // Reload theme data
        await loadThemeData();
      }
      
      return customTheme;
    } catch (err) {
      setError(err.message);
      console.error('Failed to create custom theme:', err);
      return null;
    }
  }, [loadThemeData]);

  /**
   * Delete custom theme
   */
  const deleteCustomTheme = useCallback(async (themeId) => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        throw new Error('Theme service not initialized');
      }

      setError(null);
      const success = await ThemeService.deleteCustomTheme(themeId);
      
      if (success) {
        // Reload theme data
        await loadThemeData();
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete custom theme:', err);
      return false;
    }
  }, [loadThemeData]);

  /**
   * Get theme by ID
   */
  const getThemeById = useCallback((themeId) => {
    return ThemeService.getThemeById(themeId);
  }, []);

  /**
   * Apply seasonal theme
   */
  const applySeasonalTheme = useCallback(async (seasonId) => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        throw new Error('Theme service not initialized');
      }

      setError(null);
      const success = await ThemeService.applySeasonalTheme(seasonId);
      
      if (success) {
        // Reload theme data
        await loadThemeData();
        
        // Update theme statistics
        await ThemeService.updateThemeStats('themeChanges', 1);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to apply seasonal theme:', err);
      return false;
    }
  }, [loadThemeData]);

  /**
   * Get current theme colors
   */
  const getCurrentThemeColors = useCallback(() => {
    return currentTheme ? currentTheme.colors : ThemeService.getCurrentThemeColors();
  }, [currentTheme]);

  /**
   * Get current theme particles
   */
  const getCurrentThemeParticles = useCallback(() => {
    return currentTheme ? currentTheme.particles : ThemeService.getCurrentThemeParticles();
  }, [currentTheme]);

  /**
   * Get current theme music
   */
  const getCurrentThemeMusic = useCallback(() => {
    return currentTheme ? currentTheme.music : ThemeService.getCurrentThemeMusic();
  }, [currentTheme]);

  /**
   * Check if theme is unlocked
   */
  const isThemeUnlocked = useCallback((themeId) => {
    const theme = getThemeById(themeId);
    return theme ? theme.unlocked : false;
  }, [getThemeById]);

  /**
   * Check if theme is premium
   */
  const isThemePremium = useCallback((themeId) => {
    const theme = getThemeById(themeId);
    return theme ? theme.premium : false;
  }, [getThemeById]);

  /**
   * Get custom themes
   */
  const getCustomThemes = useCallback(() => {
    return allThemes.filter(theme => theme.custom);
  }, [allThemes]);

  /**
   * Get seasonal themes
   */
  const getSeasonalThemes = useCallback(() => {
    return allThemes.filter(theme => 
      theme.id.includes('winter') || 
      theme.id.includes('spring') || 
      theme.id.includes('summer') || 
      theme.id.includes('autumn')
    );
  }, [allThemes]);

  /**
   * Get theme category
   */
  const getThemeCategory = useCallback((theme) => {
    if (theme.custom) return 'custom';
    if (theme.premium) return 'premium';
    if (theme.id.includes('winter') || theme.id.includes('spring') || 
        theme.id.includes('summer') || theme.id.includes('autumn')) return 'seasonal';
    return 'default';
  }, []);

  /**
   * Get themes by category
   */
  const getThemesByCategory = useCallback((category) => {
    return allThemes.filter(theme => getThemeCategory(theme) === category);
  }, [allThemes, getThemeCategory]);

  /**
   * Reset themes to default
   */
  const resetThemes = useCallback(async () => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        throw new Error('Theme service not initialized');
      }

      setError(null);
      const success = await ThemeService.resetThemes();
      
      if (success) {
        // Reload theme data
        await loadThemeData();
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to reset themes:', err);
      return false;
    }
  }, [loadThemeData]);

  /**
   * Update theme statistics
   */
  const updateThemeStats = useCallback(async (statType, increment = 1) => {
    try {
      if (!ThemeService.isServiceInitialized()) {
        return;
      }

      setError(null);
      await ThemeService.updateThemeStats(statType, increment);
      
      // Reload stats
      const stats = await ThemeService.getThemeStats();
      setThemeStats(stats);
    } catch (err) {
      setError(err.message);
      console.error('Failed to update theme stats:', err);
    }
  }, []);

  /**
   * Get theme preview data
   */
  const getThemePreview = useCallback((theme) => {
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
      particles: theme.particles,
      unlocked: theme.unlocked,
      premium: theme.premium,
      custom: theme.custom
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    currentTheme,
    allThemes,
    unlockedThemes,
    premiumThemes,
    themeStats,
    
    // Actions
    initialize,
    loadThemeData,
    setCurrentThemeById,
    unlockTheme,
    createCustomTheme,
    deleteCustomTheme,
    getThemeById,
    applySeasonalTheme,
    resetThemes,
    updateThemeStats,
    
    // Computed values
    currentThemeColors: getCurrentThemeColors(),
    currentThemeParticles: getCurrentThemeParticles(),
    currentThemeMusic: getCurrentThemeMusic(),
    customThemes: getCustomThemes(),
    seasonalThemes: getSeasonalThemes(),
    
    // Utilities
    isThemeUnlocked,
    isThemePremium,
    getThemeCategory,
    getThemesByCategory,
    getThemePreview,
    isAvailable: () => ThemeService.isServiceInitialized(),
  };
};

export default useTheme;
