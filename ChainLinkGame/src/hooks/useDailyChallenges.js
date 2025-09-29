import { useState, useEffect, useCallback } from 'react';
import DailyChallengeService from '../services/DailyChallengeService';
import DailyChallengeTracker from '../services/DailyChallengeTracker';

/**
 * useDailyChallenges - Custom hook for daily challenge functionality
 */
export const useDailyChallenges = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(0);

  /**
   * Initialize daily challenges service
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await DailyChallengeService.initialize();
      setIsInitialized(success);
      
      if (success) {
        // Check if we need to reset for a new day
        const needsReset = await DailyChallengeService.needsReset();
        if (needsReset) {
          await DailyChallengeService.resetForNewDay();
        }
        
        // Load initial data
        await loadInitialData();
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
   * Load initial challenges data
   */
  const loadInitialData = useCallback(async () => {
    try {
      const [challengesData, statsData, streakData] = await Promise.all([
        DailyChallengeService.getTodaysChallenges(),
        DailyChallengeService.getChallengeStats(),
        DailyChallengeService.getChallengeStreak()
      ]);
      
      setChallenges(challengesData);
      setStats(statsData);
      setStreak(streakData);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to load initial data:', err);
    }
  }, []);

  /**
   * Get today's challenges
   */
  const getTodaysChallenges = useCallback(async () => {
    try {
      if (!isInitialized) {
        throw new Error('Daily challenges service not initialized');
      }

      setError(null);
      const challengesData = await DailyChallengeService.getTodaysChallenges();
      setChallenges(challengesData);
      return challengesData;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get today\'s challenges:', err);
      return [];
    }
  }, [isInitialized]);

  /**
   * Update challenge progress
   */
  const updateChallengeProgress = useCallback(async (gameData, wordsUsed = []) => {
    try {
      if (!isInitialized) {
        throw new Error('Daily challenges service not initialized');
      }

      setError(null);
      const updatedChallenges = await DailyChallengeService.updateChallengeProgress(
        gameData,
        wordsUsed
      );
      
      setChallenges(updatedChallenges);
      
      // Update stats
      const newStats = await DailyChallengeService.getChallengeStats();
      setStats(newStats);
      
      // Update streak if any challenges were completed
      const hasCompleted = updatedChallenges.some(c => c.completed);
      if (hasCompleted) {
        const newStreak = await DailyChallengeService.updateChallengeStreak();
        setStreak(newStreak);
      }
      
      return updatedChallenges;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update challenge progress:', err);
      return [];
    }
  }, [isInitialized]);

  /**
   * Claim challenge reward
   */
  const claimChallengeReward = useCallback(async (challengeId) => {
    try {
      if (!isInitialized) {
        throw new Error('Daily challenges service not initialized');
      }

      setError(null);
      const reward = await DailyChallengeService.claimChallengeReward(challengeId);
      
      if (reward) {
        // Update local state
        setChallenges(prev => 
          prev.map(c => 
            c.id === challengeId 
              ? { ...c, claimed: true }
              : c
          )
        );
        
        // Update stats
        const newStats = await DailyChallengeService.getChallengeStats();
        setStats(newStats);
      }
      
      return reward;
    } catch (err) {
      setError(err.message);
      console.error('Failed to claim challenge reward:', err);
      return null;
    }
  }, [isInitialized]);

  /**
   * Get challenge statistics
   */
  const getChallengeStats = useCallback(async () => {
    try {
      if (!isInitialized) {
        return null;
      }

      setError(null);
      const statsData = await DailyChallengeService.getChallengeStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get challenge stats:', err);
      return null;
    }
  }, [isInitialized]);

  /**
   * Get challenge streak
   */
  const getChallengeStreak = useCallback(async () => {
    try {
      if (!isInitialized) {
        return 0;
      }

      setError(null);
      const streakData = await DailyChallengeService.getChallengeStreak();
      setStreak(streakData);
      return streakData;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get challenge streak:', err);
      return 0;
    }
  }, [isInitialized]);

  /**
   * Reset challenges for new day
   */
  const resetForNewDay = useCallback(async () => {
    try {
      if (!isInitialized) {
        throw new Error('Daily challenges service not initialized');
      }

      setError(null);
      const newChallenges = await DailyChallengeService.resetForNewDay();
      setChallenges(newChallenges);
      
      // Reset stats and streak
      const newStats = await DailyChallengeService.getChallengeStats();
      const newStreak = await DailyChallengeService.getChallengeStreak();
      setStats(newStats);
      setStreak(newStreak);
      
      return newChallenges;
    } catch (err) {
      setError(err.message);
      console.error('Failed to reset for new day:', err);
      return [];
    }
  }, [isInitialized]);

  /**
   * Start challenge tracking for a game
   */
  const startChallengeTracking = useCallback(() => {
    try {
      DailyChallengeTracker.startTracking();
      console.log('Started challenge tracking');
    } catch (err) {
      setError(err.message);
      console.error('Failed to start challenge tracking:', err);
    }
  }, []);

  /**
   * Stop challenge tracking
   */
  const stopChallengeTracking = useCallback(() => {
    try {
      DailyChallengeTracker.stopTracking();
      console.log('Stopped challenge tracking');
    } catch (err) {
      setError(err.message);
      console.error('Failed to stop challenge tracking:', err);
    }
  }, []);

  /**
   * Track word usage during gameplay
   */
  const trackWordUsed = useCallback((word) => {
    try {
      DailyChallengeTracker.trackWordUsed(word);
    } catch (err) {
      console.error('Failed to track word used:', err);
    }
  }, []);

  /**
   * Track solve time
   */
  const trackSolveTime = useCallback((solveTime) => {
    try {
      DailyChallengeTracker.trackSolveTime(solveTime);
    } catch (err) {
      console.error('Failed to track solve time:', err);
    }
  }, []);

  /**
   * Update game score
   */
  const updateGameScore = useCallback((score) => {
    try {
      DailyChallengeTracker.updateScore(score);
    } catch (err) {
      console.error('Failed to update game score:', err);
    }
  }, []);

  /**
   * Update streak
   */
  const updateStreak = useCallback((streak) => {
    try {
      DailyChallengeTracker.updateStreak(streak);
    } catch (err) {
      console.error('Failed to update streak:', err);
    }
  }, []);

  /**
   * Set game result
   */
  const setGameResult = useCallback((won, perfectGame = false) => {
    try {
      DailyChallengeTracker.setGameResult(won, perfectGame);
    } catch (err) {
      console.error('Failed to set game result:', err);
    }
  }, []);

  /**
   * Complete game and update challenges
   */
  const completeGame = useCallback(async () => {
    try {
      const updatedChallenges = await DailyChallengeTracker.completeGame();
      
      if (updatedChallenges) {
        setChallenges(updatedChallenges);
        
        // Update stats
        const newStats = await DailyChallengeService.getChallengeStats();
        setStats(newStats);
        
        // Update streak if any challenges were completed
        const hasCompleted = updatedChallenges.some(c => c.completed);
        if (hasCompleted) {
          const newStreak = await DailyChallengeService.updateChallengeStreak();
          setStreak(newStreak);
        }
      }
      
      return updatedChallenges;
    } catch (err) {
      setError(err.message);
      console.error('Failed to complete game:', err);
      return null;
    }
  }, []);

  /**
   * Get challenge hints for current game
   */
  const getChallengeHints = useCallback(async () => {
    try {
      if (!isInitialized) {
        return [];
      }

      setError(null);
      const hints = await DailyChallengeTracker.getChallengeHints();
      return hints;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get challenge hints:', err);
      return [];
    }
  }, [isInitialized]);

  /**
   * Get near completion challenges
   */
  const getNearCompletionChallenges = useCallback(async () => {
    try {
      if (!isInitialized) {
        return [];
      }

      setError(null);
      const nearCompletion = await DailyChallengeTracker.getNearCompletionChallenges();
      return nearCompletion;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get near completion challenges:', err);
      return [];
    }
  }, [isInitialized]);

  /**
   * Get challenge notifications
   */
  const getChallengeNotifications = useCallback(async () => {
    try {
      if (!isInitialized) {
        return [];
      }

      setError(null);
      const notifications = await DailyChallengeTracker.getChallengeNotifications();
      return notifications;
    } catch (err) {
      setError(err.message);
      console.error('Failed to get challenge notifications:', err);
      return [];
    }
  }, [isInitialized]);

  /**
   * Get challenge types configuration
   */
  const getChallengeTypes = useCallback(() => {
    return DailyChallengeService.getChallengeTypes();
  }, []);

  /**
   * Check if service is available
   */
  const isAvailable = useCallback(() => {
    return DailyChallengeService.isServiceInitialized();
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
    challenges,
    stats,
    streak,
    
    // Actions
    initialize,
    getTodaysChallenges,
    updateChallengeProgress,
    claimChallengeReward,
    getChallengeStats,
    getChallengeStreak,
    resetForNewDay,
    
    // Tracking
    startChallengeTracking,
    stopChallengeTracking,
    trackWordUsed,
    trackSolveTime,
    updateGameScore,
    updateStreak,
    setGameResult,
    completeGame,
    
    // Utilities
    getChallengeHints,
    getNearCompletionChallenges,
    getChallengeNotifications,
    getChallengeTypes,
    isAvailable,
    
    // Computed values
    hasUnclaimedRewards: stats ? stats.completed > stats.claimed : false,
    completionRate: stats ? stats.completionRate : 0,
    totalRewards: stats ? stats.totalReward : 0,
  };
};

export default useDailyChallenges;
