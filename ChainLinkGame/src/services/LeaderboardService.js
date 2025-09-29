import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameCenterService from './GameCenterService';
import GooglePlayService from './GooglePlayService';

/**
 * LeaderboardService - Unified leaderboard logic
 * Abstracts platform-specific services and provides cross-platform functionality
 */
class LeaderboardService {
  constructor() {
    this.platformService = Platform.OS === 'ios' ? GameCenterService : GooglePlayService;
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize the leaderboard service
   * @returns {Promise<boolean>} - Initialization success
   */
  async initialize() {
    try {
      this.isInitialized = await this.platformService.initialize();
      
      if (this.isInitialized) {
        // Load cached data
        await this.loadCache();
        console.log('LeaderboardService initialized successfully');
      } else {
        console.log('LeaderboardService initialization failed');
      }
      
      return this.isInitialized;
    } catch (error) {
      console.error('LeaderboardService initialization error:', error);
      return false;
    }
  }

  /**
   * Submit game scores to all relevant leaderboards
   * @param {Object} gameData - Game data object
   * @returns {Promise<boolean>} - Submission success
   */
  async submitGameScores(gameData) {
    try {
      if (!this.isInitialized) {
        console.log('LeaderboardService not initialized');
        return false;
      }

      // Submit to platform service
      const success = await this.platformService.submitGameScores(gameData);
      
      if (success) {
        // Update local cache
        await this.updateLocalScores(gameData);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to submit game scores:', error);
      return false;
    }
  }

  /**
   * Submit player achievements
   * @param {Object} stats - Player statistics
   * @returns {Promise<boolean>} - Submission success
   */
  async submitAchievements(stats) {
    try {
      if (!this.isInitialized) {
        console.log('LeaderboardService not initialized');
        return false;
      }

      return await this.platformService.submitGameAchievements(stats);
    } catch (error) {
      console.error('Failed to submit achievements:', error);
      return false;
    }
  }

  /**
   * Get leaderboard data with caching
   * @param {string} leaderboardId - The leaderboard identifier
   * @param {Object} options - Options for leaderboard data
   * @returns {Promise<Array>} - Leaderboard entries
   */
  async getLeaderboard(leaderboardId, options = {}) {
    try {
      const cacheKey = `${leaderboardId}_${JSON.stringify(options)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data;
        }
      }

      // Fetch from platform service
      const entries = await this.platformService.getLeaderboard(
        leaderboardId,
        options.timeScope || 0,
        options.playerScope || 0
      );

      // Cache the results
      this.cache.set(cacheKey, {
        data: entries,
        timestamp: Date.now()
      });

      // Persist cache
      await this.saveCache();

      return entries;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  /**
   * Get player's score for a specific leaderboard
   * @param {string} leaderboardId - The leaderboard identifier
   * @returns {Promise<Object|null>} - Player's score data
   */
  async getPlayerScore(leaderboardId) {
    try {
      if (!this.isInitialized) {
        return null;
      }

      return await this.platformService.getPlayerScore(leaderboardId);
    } catch (error) {
      console.error('Failed to get player score:', error);
      return null;
    }
  }

  /**
   * Show platform leaderboard UI
   * @param {string} leaderboardId - The leaderboard identifier
   */
  async showLeaderboard(leaderboardId) {
    try {
      if (!this.isInitialized) {
        console.log('LeaderboardService not initialized');
        return;
      }

      await this.platformService.showLeaderboard(leaderboardId);
    } catch (error) {
      console.error('Failed to show leaderboard:', error);
    }
  }

  /**
   * Show platform achievements UI
   */
  async showAchievements() {
    try {
      if (!this.isInitialized) {
        console.log('LeaderboardService not initialized');
        return;
      }

      await this.platformService.showAchievements();
    } catch (error) {
      console.error('Failed to show achievements:', error);
    }
  }

  /**
   * Get player information
   * @returns {Object} - Player data
   */
  getPlayerInfo() {
    return this.platformService.getPlayerInfo();
  }

  /**
   * Update local score cache
   * @param {Object} gameData - Game data object
   */
  async updateLocalScores(gameData) {
    try {
      const localScores = await this.getLocalScores();
      
      // Update high score
      if (gameData.finalScore > (localScores.highScore || 0)) {
        localScores.highScore = gameData.finalScore;
      }

      // Update weekly score
      const currentWeek = this.getCurrentWeek();
      if (!localScores.weeklyScores) {
        localScores.weeklyScores = {};
      }
      
      const weeklyScore = (localScores.weeklyScores[currentWeek] || 0) + gameData.finalScore;
      localScores.weeklyScores[currentWeek] = weeklyScore;

      // Update streak record
      if (gameData.streakRecord > (localScores.streakRecord || 0)) {
        localScores.streakRecord = gameData.streakRecord;
      }

      await AsyncStorage.setItem('chainlink_local_scores', JSON.stringify(localScores));
    } catch (error) {
      console.error('Failed to update local scores:', error);
    }
  }

  /**
   * Get local scores from storage
   * @returns {Promise<Object>} - Local scores data
   */
  async getLocalScores() {
    try {
      const scores = await AsyncStorage.getItem('chainlink_local_scores');
      return scores ? JSON.parse(scores) : {};
    } catch (error) {
      console.error('Failed to get local scores:', error);
      return {};
    }
  }

  /**
   * Get current week identifier
   * @returns {string} - Week identifier (YYYY-WW)
   */
  getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
  }

  /**
   * Load cache from storage
   */
  async loadCache() {
    try {
      const cacheData = await AsyncStorage.getItem('chainlink_leaderboard_cache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  /**
   * Save cache to storage
   */
  async saveCache() {
    try {
      const cacheArray = Array.from(this.cache.entries());
      await AsyncStorage.setItem('chainlink_leaderboard_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get leaderboard definitions
   * @returns {Object} - Leaderboard configuration
   */
  getLeaderboardConfig() {
    return {
      highScore: {
        id: Platform.OS === 'ios' ? 'chainlink.highscore' : 'CgkI8Z6Qh8QEEAIQAQ',
        name: 'High Score',
        description: 'Highest single game score'
      },
      weeklyScore: {
        id: Platform.OS === 'ios' ? 'chainlink.weeklyscore' : 'CgkI8Z6Qh8QEEAIQAg',
        name: 'Weekly Score',
        description: 'Total score this week'
      },
      streakRecord: {
        id: Platform.OS === 'ios' ? 'chainlink.streakrecord' : 'CgkI8Z6Qh8QEEAIQAw',
        name: 'Streak Record',
        description: 'Longest word streak'
      }
    };
  }

  /**
   * Check if service is available
   * @returns {boolean} - Service availability
   */
  isAvailable() {
    return this.isInitialized;
  }
}

// Export singleton instance
export default new LeaderboardService();
