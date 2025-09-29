import { useState, useEffect, useCallback } from 'react';
import SeasonService from '../services/SeasonService';
import ThemeService from '../services/ThemeService';

/**
 * useSeasonal - Custom hook for seasonal content functionality
 */
export const useSeasonal = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [seasonProgress, setSeasonProgress] = useState(0);
  const [daysUntilSeasonEnds, setDaysUntilSeasonEnds] = useState(0);
  const [seasonStats, setSeasonStats] = useState(null);
  const [seasonalChallenges, setSeasonalChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  /**
   * Initialize seasonal services
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize both services
      const [seasonSuccess, themeSuccess] = await Promise.all([
        SeasonService.initialize(),
        ThemeService.initialize()
      ]);
      
      const success = seasonSuccess && themeSuccess;
      setIsInitialized(success);
      
      if (success) {
        await loadCurrentSeason();
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
   * Load current season data
   */
  const loadCurrentSeason = useCallback(async () => {
    try {
      if (!SeasonService.isServiceInitialized()) {
        throw new Error('Season service not initialized');
      }

      setError(null);
      
      // Check if season has changed
      const seasonChanged = await SeasonService.hasSeasonChanged();
      if (seasonChanged) {
        await SeasonService.resetForNewSeason();
      }
      
      // Load current season and related data
      const [
        season,
        progress,
        daysRemaining,
        stats,
        challenges,
        completed
      ] = await Promise.all([
        SeasonService.getCurrentSeason(),
        SeasonService.getSeasonProgress(),
        SeasonService.getDaysUntilSeasonEnds(),
        SeasonService.getSeasonStats(),
        SeasonService.getSeasonalChallenges(),
        SeasonService.getCompletedSeasonalChallenges()
      ]);
      
      setCurrentSeason(season);
      setSeasonProgress(progress);
      setDaysUntilSeasonEnds(daysRemaining);
      setSeasonStats(stats);
      setSeasonalChallenges(challenges);
      setCompletedChallenges(completed);
      
      return season;
    } catch (err) {
      setError(err.message);
      console.error('Failed to load current season:', err);
      return null;
    }
  }, []);

  /**
   * Get seasonal challenges
   */
  const getSeasonalChallenges = useCallback(async () => {
    try {
      if (!SeasonService.isServiceInitialized()) {
        return [];
      }

      setError(null);
      const challenges = await SeasonService.getSeasonalChallenges();
      setSeasonalChallenges(challenges);
      return challenges;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get seasonal challenges:', err);
      return [];
    }
  }, []);

  /**
   * Get completed seasonal challenges
   */
  const getCompletedSeasonalChallenges = useCallback(async () => {
    try {
      if (!SeasonService.isServiceInitialized()) {
        return [];
      }

      setError(null);
      const completed = await SeasonService.getCompletedSeasonalChallenges();
      setCompletedChallenges(completed);
      return completed;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get completed challenges:', err);
      return [];
    }
  }, []);

  /**
   * Complete a seasonal challenge
   */
  const completeSeasonalChallenge = useCallback(async (challengeId) => {
    try {
      if (!SeasonService.isServiceInitialized()) {
        throw new Error('Season service not initialized');
      }

      setError(null);
      const success = await SeasonService.completeSeasonalChallenge(challengeId);
      
      if (success) {
        // Update local state
        setCompletedChallenges(prev => [...prev, challengeId]);
        
        // Update season stats
        const newStats = await SeasonService.getSeasonStats();
        setSeasonStats(newStats);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to complete seasonal challenge:', err);
      return false;
    }
  }, []);

  /**
   * Update season statistics
   */
  const updateSeasonStats = useCallback(async (gameData) => {
    try {
      if (!SeasonService.isServiceInitialized()) {
        return null;
      }

      setError(null);
      const updatedStats = await SeasonService.updateSeasonStats(gameData);
      if (updatedStats) {
        setSeasonStats(updatedStats);
      }
      return updatedStats;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update season stats:', err);
      return null;
    }
  }, []);

  /**
   * Get seasonal word categories
   */
  const getSeasonalWordCategories = useCallback(async () => {
    try {
      if (!SeasonService.isServiceInitialized()) {
        return [];
      }

      setError(null);
      const categories = await SeasonService.getSeasonalWordCategories();
      return categories;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get seasonal word categories:', err);
      return [];
    }
  }, []);

  /**
   * Apply seasonal theme
   */
  const applySeasonalTheme = useCallback(async () => {
    try {
      if (!currentSeason || !ThemeService.isServiceInitialized()) {
        throw new Error('Season or theme service not initialized');
      }

      setError(null);
      const success = await ThemeService.applySeasonalTheme(currentSeason.id);
      
      if (success) {
        // Update theme statistics
        await ThemeService.updateThemeStats('themeChanges', 1);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to apply seasonal theme:', err);
      return false;
    }
  }, [currentSeason]);

  /**
   * Get seasonal theme
   */
  const getSeasonalTheme = useCallback(async () => {
    try {
      if (!SeasonService.isServiceInitialized()) {
        return null;
      }

      setError(null);
      const theme = await SeasonService.getSeasonalTheme();
      return theme;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get seasonal theme:', err);
      return null;
    }
  }, []);

  /**
   * Get season by ID
   */
  const getSeasonById = useCallback((seasonId) => {
    return SeasonService.getSeasonById(seasonId);
  }, []);

  /**
   * Get all available seasons
   */
  const getAllSeasons = useCallback(() => {
    return SeasonService.getAllSeasons();
  }, []);

  /**
   * Check if current season has seasonal challenges
   */
  const hasSeasonalChallenges = useCallback(() => {
    return seasonalChallenges && seasonalChallenges.length > 0;
  }, [seasonalChallenges]);

  /**
   * Get seasonal challenge progress
   */
  const getSeasonalChallengeProgress = useCallback(() => {
    if (!seasonalChallenges || seasonalChallenges.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const completed = completedChallenges.length;
    const total = seasonalChallenges.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  }, [seasonalChallenges, completedChallenges]);

  /**
   * Get seasonal rewards earned
   */
  const getSeasonalRewardsEarned = useCallback(() => {
    if (!seasonalChallenges || !seasonStats) {
      return { coins: 0, xp: 0, items: [] };
    }
    
    // Calculate rewards from completed challenges
    const completedChallengeRewards = seasonalChallenges
      .filter(challenge => completedChallenges.includes(challenge.id))
      .reduce((acc, challenge) => {
        acc.coins += challenge.reward.coins || 0;
        acc.xp += challenge.reward.xp || 0;
        if (challenge.reward.item) {
          acc.items.push(challenge.reward.item);
        }
        return acc;
      }, { coins: 0, xp: 0, items: [] });
    
    return completedChallengeRewards;
  }, [seasonalChallenges, completedChallenges, seasonStats]);

  /**
   * Check if season is ending soon
   */
  const isSeasonEndingSoon = useCallback(() => {
    return daysUntilSeasonEnds <= 7; // 7 days or less
  }, [daysUntilSeasonEnds]);

  /**
   * Get season status
   */
  const getSeasonStatus = useCallback(() => {
    if (!currentSeason) return 'unknown';
    
    if (daysUntilSeasonEnds <= 0) return 'ended';
    if (daysUntilSeasonEnds <= 7) return 'ending_soon';
    if (seasonProgress >= 90) return 'nearly_complete';
    return 'active';
  }, [currentSeason, daysUntilSeasonEnds, seasonProgress]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    currentSeason,
    seasonProgress,
    daysUntilSeasonEnds,
    seasonStats,
    seasonalChallenges,
    completedChallenges,
    
    // Actions
    initialize,
    loadCurrentSeason,
    getSeasonalChallenges,
    getCompletedSeasonalChallenges,
    completeSeasonalChallenge,
    updateSeasonStats,
    getSeasonalWordCategories,
    applySeasonalTheme,
    getSeasonalTheme,
    getSeasonById,
    getAllSeasons,
    
    // Computed values
    hasSeasonalChallenges: hasSeasonalChallenges(),
    challengeProgress: getSeasonalChallengeProgress(),
    rewardsEarned: getSeasonalRewardsEarned(),
    isSeasonEndingSoon: isSeasonEndingSoon(),
    seasonStatus: getSeasonStatus(),
    
    // Utilities
    isAvailable: () => SeasonService.isServiceInitialized(),
  };
};

export default useSeasonal;
