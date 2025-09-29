import { useState, useEffect, useCallback } from 'react';
import UserProfileService from '../services/UserProfileService';

/**
 * useUserProfile - Custom hook for user profile management
 */
export const useUserProfile = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState(null);

  /**
   * Initialize user profile service
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await UserProfileService.initialize();
      setIsInitialized(success);
      
      if (success) {
        const user = UserProfileService.getUserData();
        const userStats = UserProfileService.getStats();
        const userPreferences = UserProfileService.getPreferences();
        
        setUserData(user);
        setStats(userStats);
        setPreferences(userPreferences);
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
   * Update game statistics after a game
   */
  const updateGameStats = useCallback(async (gameData) => {
    try {
      if (!isInitialized) {
        throw new Error('User profile service not initialized');
      }

      setError(null);
      const updatedStats = await UserProfileService.updateGameStats(gameData);
      setStats(updatedStats);
      
      // Update user data as well (for level changes)
      const updatedUserData = UserProfileService.getUserData();
      setUserData(updatedUserData);
      
      return updatedStats;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update game stats:', err);
      return null;
    }
  }, [isInitialized]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      if (!isInitialized) {
        throw new Error('User profile service not initialized');
      }

      setError(null);
      await UserProfileService.updatePreferences(newPreferences);
      
      // Update local state
      const updatedPreferences = UserProfileService.getPreferences();
      setPreferences(updatedPreferences);
      
      return updatedPreferences;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update preferences:', err);
      return null;
    }
  }, [isInitialized]);

  /**
   * Add coins to user account
   */
  const addCoins = useCallback(async (coins) => {
    try {
      if (!isInitialized) {
        throw new Error('User profile service not initialized');
      }

      setError(null);
      await UserProfileService.addCoins(coins);
      
      // Update local state
      const updatedUserData = UserProfileService.getUserData();
      const updatedStats = UserProfileService.getStats();
      setUserData(updatedUserData);
      setStats(updatedStats);
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Failed to add coins:', err);
      return false;
    }
  }, [isInitialized]);

  /**
   * Spend coins from user account
   */
  const spendCoins = useCallback(async (coins) => {
    try {
      if (!isInitialized) {
        throw new Error('User profile service not initialized');
      }

      setError(null);
      const success = await UserProfileService.spendCoins(coins);
      
      if (success) {
        // Update local state
        const updatedUserData = UserProfileService.getUserData();
        const updatedStats = UserProfileService.getStats();
        setUserData(updatedUserData);
        setStats(updatedStats);
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Failed to spend coins:', err);
      return false;
    }
  }, [isInitialized]);

  /**
   * Unlock achievement
   */
  const unlockAchievement = useCallback(async (achievementId) => {
    try {
      if (!isInitialized) {
        throw new Error('User profile service not initialized');
      }

      setError(null);
      await UserProfileService.unlockAchievement(achievementId);
      
      // Update local state
      const updatedUserData = UserProfileService.getUserData();
      const updatedStats = UserProfileService.getStats();
      setUserData(updatedUserData);
      setStats(updatedStats);
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Failed to unlock achievement:', err);
      return false;
    }
  }, [isInitialized]);

  /**
   * Reset all user data (for testing)
   */
  const resetUserData = useCallback(async () => {
    try {
      setError(null);
      await UserProfileService.resetUserData();
      
      // Reinitialize
      await initialize();
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Failed to reset user data:', err);
      return false;
    }
  }, [initialize]);

  /**
   * Calculate XP needed for next level
   */
  const getXPForNextLevel = useCallback(() => {
    if (!userData) return 0;
    
    const currentLevel = userData.level;
    const nextLevel = currentLevel + 1;
    
    // XP formula: level = floor(sqrt(experience / 100)) + 1
    // So experience = (level - 1)^2 * 100
    const nextLevelXP = (nextLevel - 1) * (nextLevel - 1) * 100;
    const currentLevelXP = (currentLevel - 1) * (currentLevel - 1) * 100;
    
    return nextLevelXP - currentLevelXP;
  }, [userData]);

  /**
   * Get XP progress to next level
   */
  const getXPProgress = useCallback(() => {
    if (!userData) return { current: 0, needed: 0, percentage: 0 };
    
    const currentLevel = userData.level;
    const currentXP = userData.experience;
    
    const currentLevelXP = (currentLevel - 1) * (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * currentLevel * 100;
    
    const progressXP = currentXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    
    return {
      current: progressXP,
      needed: neededXP,
      percentage: Math.min(100, (progressXP / neededXP) * 100)
    };
  }, [userData]);

  /**
   * Get user's win rate
   */
  const getWinRate = useCallback(() => {
    if (!stats || stats.gamesPlayed === 0) return 0;
    return (stats.gamesWon / stats.gamesPlayed) * 100;
  }, [stats]);

  /**
   * Get user's average score
   */
  const getAverageScore = useCallback(() => {
    if (!stats || stats.gamesPlayed === 0) return 0;
    return Math.round(stats.totalScore / stats.gamesPlayed);
  }, [stats]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    userData,
    stats,
    preferences,
    
    // Actions
    initialize,
    updateGameStats,
    updatePreferences,
    addCoins,
    spendCoins,
    unlockAchievement,
    resetUserData,
    
    // Computed values
    level: userData?.level || 1,
    experience: userData?.experience || 0,
    coins: userData?.totalCoins || 0,
    playerName: userData?.playerName || 'Player',
    achievements: userData?.achievements || [],
    unlockedThemes: userData?.unlockedThemes || ['default'],
    currentTheme: userData?.currentTheme || 'default',
    
    // Stats
    gamesPlayed: stats?.gamesPlayed || 0,
    gamesWon: stats?.gamesWon || 0,
    highScore: stats?.highScore || 0,
    maxStreak: stats?.maxStreak || 0,
    currentStreak: stats?.currentStreak || 0,
    perfectGames: stats?.perfectGames || 0,
    multiplayerWins: stats?.multiplayerWins || 0,
    
    // Calculated values
    winRate: getWinRate(),
    averageScore: getAverageScore(),
    xpForNextLevel: getXPForNextLevel(),
    xpProgress: getXPProgress(),
    
    // Settings
    soundEnabled: preferences?.soundEnabled ?? true,
    musicEnabled: preferences?.musicEnabled ?? true,
    vibrationEnabled: preferences?.vibrationEnabled ?? true,
    notificationsEnabled: preferences?.notificationsEnabled ?? true,
    difficulty: preferences?.difficulty || 'normal',
  };
};

export default useUserProfile;
