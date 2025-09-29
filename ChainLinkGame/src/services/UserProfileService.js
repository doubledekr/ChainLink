import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * UserProfileService - User data management
 * Handles user statistics, preferences, and profile data
 */
class UserProfileService {
  constructor() {
    this.userData = null;
    this.stats = null;
    this.preferences = null;
  }

  /**
   * Initialize user profile service
   * @returns {Promise<boolean>} - Initialization success
   */
  async initialize() {
    try {
      await this.loadUserData();
      await this.loadStats();
      await this.loadPreferences();
      
      // If no user data exists, create default profile
      if (!this.userData) {
        await this.createDefaultProfile();
      }
      
      console.log('UserProfileService initialized');
      return true;
    } catch (error) {
      console.error('UserProfileService initialization failed:', error);
      return false;
    }
  }

  /**
   * Create default user profile
   */
  async createDefaultProfile() {
    const defaultProfile = {
      playerId: this.generatePlayerId(),
      playerName: 'Player',
      level: 1,
      experience: 0,
      totalCoins: 0,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      achievements: [],
      unlockedThemes: ['default'],
      currentTheme: 'default',
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        notificationsEnabled: true,
        difficulty: 'normal'
      }
    };

    this.userData = defaultProfile;
    await this.saveUserData();
  }

  /**
   * Generate unique player ID
   * @returns {string} - Unique player identifier
   */
  generatePlayerId() {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load user data from storage
   */
  async loadUserData() {
    try {
      const data = await AsyncStorage.getItem('chainlink_user_profile');
      this.userData = data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      this.userData = null;
    }
  }

  /**
   * Save user data to storage
   */
  async saveUserData() {
    try {
      if (this.userData) {
        this.userData.lastActive = new Date().toISOString();
        await AsyncStorage.setItem('chainlink_user_profile', JSON.stringify(this.userData));
      }
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  /**
   * Load user statistics from storage
   */
  async loadStats() {
    try {
      const data = await AsyncStorage.getItem('chainlink_user_stats');
      this.stats = data ? JSON.parse(data) : this.getDefaultStats();
    } catch (error) {
      console.error('Failed to load stats:', error);
      this.stats = this.getDefaultStats();
    }
  }

  /**
   * Save user statistics to storage
   */
  async saveStats() {
    try {
      if (this.stats) {
        await AsyncStorage.setItem('chainlink_user_stats', JSON.stringify(this.stats));
      }
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  /**
   * Load user preferences from storage
   */
  async loadPreferences() {
    try {
      const data = await AsyncStorage.getItem('chainlink_user_preferences');
      this.preferences = data ? JSON.parse(data) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Failed to load preferences:', error);
      this.preferences = this.getDefaultPreferences();
    }
  }

  /**
   * Save user preferences to storage
   */
  async savePreferences() {
    try {
      if (this.preferences) {
        await AsyncStorage.setItem('chainlink_user_preferences', JSON.stringify(this.preferences));
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Get default statistics
   * @returns {Object} - Default stats object
   */
  getDefaultStats() {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalScore: 0,
      highScore: 0,
      weeklyScore: 0,
      maxStreak: 0,
      currentStreak: 0,
      perfectGames: 0,
      averageSolveTime: 0,
      totalSolveTime: 0,
      multiplayerWins: 0,
      multiplayerLosses: 0,
      dailyChallengeStreak: 0,
      achievementsUnlocked: 0,
      themesUnlocked: 1,
      coinsEarned: 0,
      coinsSpent: 0,
      lastGameDate: null,
      lastWeeklyReset: null
    };
  }

  /**
   * Get default preferences
   * @returns {Object} - Default preferences object
   */
  getDefaultPreferences() {
    return {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      notificationsEnabled: true,
      difficulty: 'normal',
      theme: 'default',
      language: 'en',
      autoSubmit: true,
      showHints: true,
      confirmQuit: true
    };
  }

  /**
   * Update user statistics after a game
   * @param {Object} gameData - Game data object
   */
  async updateGameStats(gameData) {
    try {
      if (!this.stats) {
        this.stats = this.getDefaultStats();
      }

      // Update basic stats
      this.stats.gamesPlayed++;
      
      if (gameData.won) {
        this.stats.gamesWon++;
      } else {
        this.stats.gamesLost++;
      }

      // Update scores
      this.stats.totalScore += gameData.finalScore;
      
      if (gameData.finalScore > this.stats.highScore) {
        this.stats.highScore = gameData.finalScore;
      }

      // Update weekly score
      const currentWeek = this.getCurrentWeek();
      if (this.stats.lastWeeklyReset !== currentWeek) {
        this.stats.weeklyScore = 0;
        this.stats.lastWeeklyReset = currentWeek;
      }
      this.stats.weeklyScore += gameData.finalScore;

      // Update streak
      if (gameData.won) {
        this.stats.currentStreak++;
        if (this.stats.currentStreak > this.stats.maxStreak) {
          this.stats.maxStreak = this.stats.currentStreak;
        }
      } else {
        this.stats.currentStreak = 0;
      }

      // Update solve time stats
      this.stats.totalSolveTime += gameData.solveTime;
      this.stats.averageSolveTime = this.stats.totalSolveTime / this.stats.gamesPlayed;

      // Check for perfect game
      if (gameData.perfectGame) {
        this.stats.perfectGames++;
      }

      // Update experience and level
      const xpGained = this.calculateXPGain(gameData);
      await this.addExperience(xpGained);

      // Update last game date
      this.stats.lastGameDate = new Date().toISOString();

      // Save updated stats
      await this.saveStats();
      
      return this.stats;
    } catch (error) {
      console.error('Failed to update game stats:', error);
      return this.stats;
    }
  }

  /**
   * Calculate XP gain from game data
   * @param {Object} gameData - Game data object
   * @returns {number} - XP gained
   */
  calculateXPGain(gameData) {
    let xp = 0;

    // Base XP for completing a game
    xp += gameData.won ? 10 : 5;

    // Bonus XP for score
    xp += Math.floor(gameData.finalScore / 100);

    // Bonus XP for streak
    if (gameData.streak > 0) {
      xp += gameData.streak * 2;
    }

    // Bonus XP for perfect game
    if (gameData.perfectGame) {
      xp += 25;
    }

    // Bonus XP for speed
    if (gameData.solveTime < 10) {
      xp += 15;
    } else if (gameData.solveTime < 20) {
      xp += 10;
    }

    return xp;
  }

  /**
   * Add experience points and handle leveling
   * @param {number} xp - Experience points to add
   */
  async addExperience(xp) {
    if (!this.userData) return;

    this.userData.experience += xp;
    
    // Check for level up
    const newLevel = this.calculateLevel(this.userData.experience);
    if (newLevel > this.userData.level) {
      const oldLevel = this.userData.level;
      this.userData.level = newLevel;
      
      // Award coins for leveling up
      const coinsEarned = (newLevel - oldLevel) * 50;
      this.userData.totalCoins += coinsEarned;
      
      console.log(`Level up! ${oldLevel} -> ${newLevel}, earned ${coinsEarned} coins`);
      
      // Save updated profile
      await this.saveUserData();
    }
  }

  /**
   * Calculate level from experience
   * @param {number} experience - Total experience points
   * @returns {number} - Current level
   */
  calculateLevel(experience) {
    // Level formula: level = floor(sqrt(experience / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
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
   * Update user preferences
   * @param {Object} newPreferences - New preference values
   */
  async updatePreferences(newPreferences) {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      await this.savePreferences();
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }

  /**
   * Add coins to user account
   * @param {number} coins - Coins to add
   */
  async addCoins(coins) {
    try {
      if (this.userData) {
        this.userData.totalCoins += coins;
        this.stats.coinsEarned += coins;
        await this.saveUserData();
        await this.saveStats();
      }
    } catch (error) {
      console.error('Failed to add coins:', error);
    }
  }

  /**
   * Spend coins from user account
   * @param {number} coins - Coins to spend
   * @returns {boolean} - Success status
   */
  async spendCoins(coins) {
    try {
      if (this.userData && this.userData.totalCoins >= coins) {
        this.userData.totalCoins -= coins;
        this.stats.coinsSpent += coins;
        await this.saveUserData();
        await this.saveStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to spend coins:', error);
      return false;
    }
  }

  /**
   * Unlock achievement
   * @param {string} achievementId - Achievement identifier
   */
  async unlockAchievement(achievementId) {
    try {
      if (this.userData && !this.userData.achievements.includes(achievementId)) {
        this.userData.achievements.push(achievementId);
        this.stats.achievementsUnlocked++;
        await this.saveUserData();
        await this.saveStats();
      }
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
    }
  }

  /**
   * Get user data
   * @returns {Object|null} - User data object
   */
  getUserData() {
    return this.userData;
  }

  /**
   * Get user statistics
   * @returns {Object|null} - User statistics object
   */
  getStats() {
    return this.stats;
  }

  /**
   * Get user preferences
   * @returns {Object|null} - User preferences object
   */
  getPreferences() {
    return this.preferences;
  }

  /**
   * Reset all user data (for testing purposes)
   */
  async resetUserData() {
    try {
      await AsyncStorage.removeItem('chainlink_user_profile');
      await AsyncStorage.removeItem('chainlink_user_stats');
      await AsyncStorage.removeItem('chainlink_user_preferences');
      
      this.userData = null;
      this.stats = null;
      this.preferences = null;
      
      await this.initialize();
    } catch (error) {
      console.error('Failed to reset user data:', error);
    }
  }
}

// Export singleton instance
export default new UserProfileService();
