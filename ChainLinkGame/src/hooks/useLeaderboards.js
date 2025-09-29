import { useState, useEffect, useCallback } from 'react';
import LeaderboardService from '../services/LeaderboardService';

/**
 * useLeaderboards - Custom hook for leaderboard functionality
 */
export const useLeaderboards = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);

  /**
   * Initialize leaderboard service
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await LeaderboardService.initialize();
      setIsInitialized(success);
      
      if (success) {
        const info = LeaderboardService.getPlayerInfo();
        setPlayerInfo(info);
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
   * Submit game scores to leaderboards
   */
  const submitGameScores = useCallback(async (gameData) => {
    try {
      if (!isInitialized) {
        throw new Error('Leaderboard service not initialized');
      }

      setError(null);
      const success = await LeaderboardService.submitGameScores(gameData);
      
      if (!success) {
        throw new Error('Failed to submit scores to leaderboard');
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to submit game scores:', err);
      return false;
    }
  }, [isInitialized]);

  /**
   * Submit achievements
   */
  const submitAchievements = useCallback(async (stats) => {
    try {
      if (!isInitialized) {
        throw new Error('Leaderboard service not initialized');
      }

      setError(null);
      const success = await LeaderboardService.submitAchievements(stats);
      
      if (!success) {
        throw new Error('Failed to submit achievements');
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to submit achievements:', err);
      return false;
    }
  }, [isInitialized]);

  /**
   * Get leaderboard data
   */
  const getLeaderboard = useCallback(async (leaderboardId, options = {}) => {
    try {
      if (!isInitialized) {
        throw new Error('Leaderboard service not initialized');
      }

      setError(null);
      const entries = await LeaderboardService.getLeaderboard(leaderboardId, options);
      return entries;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get leaderboard:', err);
      return [];
    }
  }, [isInitialized]);

  /**
   * Get player's score for a leaderboard
   */
  const getPlayerScore = useCallback(async (leaderboardId) => {
    try {
      if (!isInitialized) {
        return null;
      }

      setError(null);
      const score = await LeaderboardService.getPlayerScore(leaderboardId);
      return score;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get player score:', err);
      return null;
    }
  }, [isInitialized]);

  /**
   * Show native leaderboard UI
   */
  const showLeaderboard = useCallback(async (leaderboardId) => {
    try {
      if (!isInitialized) {
        throw new Error('Leaderboard service not initialized');
      }

      setError(null);
      await LeaderboardService.showLeaderboard(leaderboardId);
    } catch (err) {
      setError(err.message);
      console.error('Failed to show leaderboard:', err);
    }
  }, [isInitialized]);

  /**
   * Show native achievements UI
   */
  const showAchievements = useCallback(async () => {
    try {
      if (!isInitialized) {
        throw new Error('Leaderboard service not initialized');
      }

      setError(null);
      await LeaderboardService.showAchievements();
    } catch (err) {
      setError(err.message);
      console.error('Failed to show achievements:', err);
    }
  }, [isInitialized]);

  /**
   * Get leaderboard configuration
   */
  const getLeaderboardConfig = useCallback(() => {
    return LeaderboardService.getLeaderboardConfig();
  }, []);

  /**
   * Check if service is available
   */
  const isAvailable = useCallback(() => {
    return LeaderboardService.isAvailable();
  }, [isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    playerInfo,
    
    // Actions
    initialize,
    submitGameScores,
    submitAchievements,
    getLeaderboard,
    getPlayerScore,
    showLeaderboard,
    showAchievements,
    getLeaderboardConfig,
    isAvailable,
    
    // Computed
    isAuthenticated: playerInfo?.isAuthenticated || false,
    playerName: playerInfo?.playerAlias || playerInfo?.playerName || null,
  };
};

export default useLeaderboards;
