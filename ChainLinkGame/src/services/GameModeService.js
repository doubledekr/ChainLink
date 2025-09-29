import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * GameModeService - Game mode management system
 * Handles different game modes, their configurations, and statistics
 */
class GameModeService {
  constructor() {
    this.currentMode = null;
    this.modes = new Map();
    this.isInitialized = false;
    this.gameModeConfig = this.initializeGameModeConfig();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.loadModes();
      this.isInitialized = true;
      console.log('GameModeService initialized');
      return true;
    } catch (error) {
      console.error('GameModeService initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize game mode configuration
   */
  initializeGameModeConfig() {
    return {
      SINGLE: {
        id: 'SINGLE',
        name: 'Classic Mode',
        description: 'The original ChainLink experience',
        icon: 'game-controller',
        color: '#4A90E2',
        timeLimit: 30, // 30 seconds per puzzle
        totalTime: 300, // 5 minutes total
        rounds: 10,
        scoring: 'standard',
        difficulty: 'normal',
        unlockRequirement: null,
        leaderboardEnabled: true,
        dailyChallengesEnabled: true,
        seasonalChallengesEnabled: true,
        hints: 3,
        lives: 1,
        powerUps: false,
        multiplayer: false
      },
      BLITZ: {
        id: 'BLITZ',
        name: 'Blitz Mode',
        description: '60-second rapid fire word puzzles',
        icon: 'flash',
        color: '#FF6B6B',
        timeLimit: 15, // 15 seconds per puzzle
        totalTime: 60, // 1 minute total
        rounds: 'unlimited',
        scoring: 'speed_bonus',
        difficulty: 'normal',
        unlockRequirement: null,
        leaderboardEnabled: true,
        dailyChallengesEnabled: true,
        seasonalChallengesEnabled: true,
        hints: 1,
        lives: 1,
        powerUps: false,
        multiplayer: false,
        specialRules: {
          rapidFire: true,
          scoreMultiplier: 1.5,
          timeBonus: true
        }
      },
      ZEN: {
        id: 'ZEN',
        name: 'Zen Mode',
        description: 'Relaxed, untimed gameplay for learning',
        icon: 'leaf',
        color: '#4CAF50',
        timeLimit: null, // No time limit
        totalTime: null, // No total time limit
        rounds: 'unlimited',
        scoring: 'learning_focused',
        difficulty: 'adaptive',
        unlockRequirement: null,
        leaderboardEnabled: false,
        dailyChallengesEnabled: false,
        seasonalChallengesEnabled: true,
        hints: 'unlimited',
        lives: 'unlimited',
        powerUps: false,
        multiplayer: false,
        specialRules: {
          noTimePressure: true,
          hintSystem: true,
          adaptiveDifficulty: true,
          learningMode: true
        }
      },
      SURVIVAL: {
        id: 'SURVIVAL',
        name: 'Survival Mode',
        description: 'Endless challenge with increasing difficulty',
        icon: 'shield',
        color: '#FFA726',
        timeLimit: 30, // Start with 30 seconds
        totalTime: null, // Endless
        rounds: 'unlimited',
        scoring: 'survival_based',
        difficulty: 'progressive',
        unlockRequirement: 'level_5',
        leaderboardEnabled: true,
        dailyChallengesEnabled: false,
        seasonalChallengesEnabled: true,
        hints: 2,
        lives: 3,
        powerUps: true,
        multiplayer: false,
        specialRules: {
          progressiveDifficulty: true,
          timeReduction: true,
          powerUps: true,
          lives: true,
          highScoreFocus: true
        }
      },
      TOURNAMENT: {
        id: 'TOURNAMENT',
        name: 'Tournament Mode',
        description: 'Bracket-style competition against other players',
        icon: 'trophy',
        color: '#9C27B0',
        timeLimit: 30,
        totalTime: 300,
        rounds: 5,
        scoring: 'tournament',
        difficulty: 'hard',
        unlockRequirement: 'level_10',
        leaderboardEnabled: true,
        dailyChallengesEnabled: false,
        seasonalChallengesEnabled: false,
        hints: 0,
        lives: 1,
        powerUps: false,
        multiplayer: true,
        specialRules: {
          bracketStyle: true,
          entryFee: true,
          prizePool: true,
          bestOfThree: true,
          elimination: true
        }
      },
      PRACTICE: {
        id: 'PRACTICE',
        name: 'Practice Mode',
        description: 'Tutorial and skill building exercises',
        icon: 'school',
        color: '#607D8B',
        timeLimit: null,
        totalTime: null,
        rounds: 'custom',
        scoring: 'tutorial',
        difficulty: 'tutorial',
        unlockRequirement: null,
        leaderboardEnabled: false,
        dailyChallengesEnabled: false,
        seasonalChallengesEnabled: false,
        hints: 'unlimited',
        lives: 'unlimited',
        powerUps: false,
        multiplayer: false,
        specialRules: {
          tutorialMode: true,
          skillBuilding: true,
          guidedLearning: true,
          noPressure: true
        }
      }
    };
  }

  /**
   * Get game mode by ID
   */
  getGameMode(modeId) {
    return this.gameModeConfig[modeId] || this.gameModeConfig.SINGLE;
  }

  /**
   * Get all available game modes
   */
  getAllGameModes() {
    return Object.values(this.gameModeConfig);
  }

  /**
   * Get unlocked game modes for current player
   */
  async getUnlockedGameModes() {
    try {
      const playerLevel = await this.getPlayerLevel();
      const modes = Object.values(this.gameModeConfig);
      
      return modes.filter(mode => {
        if (!mode.unlockRequirement) return true;
        
        // Check unlock requirements
        switch (mode.unlockRequirement) {
          case 'level_5':
            return playerLevel >= 5;
          case 'level_10':
            return playerLevel >= 10;
          default:
            return true;
        }
      });
    } catch (error) {
      console.error('Failed to get unlocked game modes:', error);
      return [this.gameModeConfig.SINGLE]; // Default to single mode
    }
  }

  /**
   * Get player level
   */
  async getPlayerLevel() {
    try {
      const userProfile = await AsyncStorage.getItem('chainlink_user_profile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return profile.level || 1;
      }
      return 1;
    } catch (error) {
      console.error('Failed to get player level:', error);
      return 1;
    }
  }

  /**
   * Start a game mode
   */
  async startGameMode(modeId) {
    try {
      const mode = this.getGameMode(modeId);
      if (!mode) {
        throw new Error(`Invalid game mode: ${modeId}`);
      }

      this.currentMode = mode;
      
      // Initialize mode-specific data
      await this.initializeModeData(modeId);
      
      console.log(`Started game mode: ${mode.name}`);
      return mode;
    } catch (error) {
      console.error('Failed to start game mode:', error);
      return null;
    }
  }

  /**
   * End current game mode
   */
  async endGameMode(gameData) {
    try {
      if (!this.currentMode) return null;

      // Save game results
      await this.saveGameResults(gameData);
      
      // Update mode statistics
      await this.updateModeStats(this.currentMode.id, gameData);
      
      const mode = this.currentMode;
      this.currentMode = null;
      
      console.log(`Ended game mode: ${mode.name}`);
      return mode;
    } catch (error) {
      console.error('Failed to end game mode:', error);
      return null;
    }
  }

  /**
   * Initialize mode-specific data
   */
  async initializeModeData(modeId) {
    try {
      const modeData = {
        modeId,
        startTime: Date.now(),
        currentRound: 1,
        score: 0,
        streak: 0,
        hintsUsed: 0,
        livesRemaining: this.getGameMode(modeId).lives || 1,
        powerUpsUsed: 0,
        timeRemaining: this.getGameMode(modeId).totalTime,
        difficulty: this.getGameMode(modeId).difficulty
      };

      await AsyncStorage.setItem('current_game_mode', JSON.stringify(modeData));
    } catch (error) {
      console.error('Failed to initialize mode data:', error);
    }
  }

  /**
   * Get current mode data
   */
  async getCurrentModeData() {
    try {
      const modeData = await AsyncStorage.getItem('current_game_mode');
      return modeData ? JSON.parse(modeData) : null;
    } catch (error) {
      console.error('Failed to get current mode data:', error);
      return null;
    }
  }

  /**
   * Update current mode data
   */
  async updateCurrentModeData(updates) {
    try {
      const currentData = await this.getCurrentModeData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await AsyncStorage.setItem('current_game_mode', JSON.stringify(updatedData));
        return updatedData;
      }
      return null;
    } catch (error) {
      console.error('Failed to update mode data:', error);
      return null;
    }
  }

  /**
   * Save game results
   */
  async saveGameResults(gameData) {
    try {
      const results = {
        modeId: this.currentMode.id,
        score: gameData.finalScore || 0,
        roundsCompleted: gameData.roundsCompleted || 0,
        timePlayed: gameData.timePlayed || 0,
        hintsUsed: gameData.hintsUsed || 0,
        livesLost: gameData.livesLost || 0,
        powerUpsUsed: gameData.powerUpsUsed || 0,
        streak: gameData.streak || 0,
        difficulty: gameData.difficulty || 'normal',
        date: new Date().toISOString()
      };

      // Get existing results
      const existingResults = await AsyncStorage.getItem('game_mode_results');
      const allResults = existingResults ? JSON.parse(existingResults) : [];
      
      // Add new result
      allResults.push(results);
      
      // Keep only last 100 results
      if (allResults.length > 100) {
        allResults.splice(0, allResults.length - 100);
      }
      
      await AsyncStorage.setItem('game_mode_results', JSON.stringify(allResults));
      
      return results;
    } catch (error) {
      console.error('Failed to save game results:', error);
      return null;
    }
  }

  /**
   * Update mode statistics
   */
  async updateModeStats(modeId, gameData) {
    try {
      const statsKey = `mode_stats_${modeId}`;
      const existingStats = await AsyncStorage.getItem(statsKey);
      const stats = existingStats ? JSON.parse(existingStats) : {
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        totalTime: 0,
        averageScore: 0,
        bestStreak: 0,
        hintsUsed: 0,
        livesLost: 0,
        powerUpsUsed: 0
      };

      // Update statistics
      stats.gamesPlayed += 1;
      stats.totalScore += gameData.finalScore || 0;
      stats.bestScore = Math.max(stats.bestScore, gameData.finalScore || 0);
      stats.totalTime += gameData.timePlayed || 0;
      stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed);
      stats.bestStreak = Math.max(stats.bestStreak, gameData.streak || 0);
      stats.hintsUsed += gameData.hintsUsed || 0;
      stats.livesLost += gameData.livesLost || 0;
      stats.powerUpsUsed += gameData.powerUpsUsed || 0;

      await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Failed to update mode stats:', error);
      return null;
    }
  }

  /**
   * Get mode statistics
   */
  async getModeStats(modeId) {
    try {
      const statsKey = `mode_stats_${modeId}`;
      const stats = await AsyncStorage.getItem(statsKey);
      return stats ? JSON.parse(stats) : {
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        totalTime: 0,
        averageScore: 0,
        bestStreak: 0,
        hintsUsed: 0,
        livesLost: 0,
        powerUpsUsed: 0
      };
    } catch (error) {
      console.error('Failed to get mode stats:', error);
      return null;
    }
  }

  /**
   * Get all mode statistics
   */
  async getAllModeStats() {
    try {
      const modes = Object.keys(this.gameModeConfig);
      const stats = {};
      
      for (const modeId of modes) {
        stats[modeId] = await this.getModeStats(modeId);
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get all mode stats:', error);
      return {};
    }
  }

  /**
   * Get game mode leaderboard
   */
  async getModeLeaderboard(modeId) {
    try {
      const results = await AsyncStorage.getItem('game_mode_results');
      if (!results) return [];

      const allResults = JSON.parse(results);
      const modeResults = allResults.filter(result => result.modeId === modeId);
      
      // Sort by score (descending)
      return modeResults.sort((a, b) => b.score - a.score).slice(0, 100);
    } catch (error) {
      console.error('Failed to get mode leaderboard:', error);
      return [];
    }
  }

  /**
   * Check if mode is unlocked
   */
  async isModeUnlocked(modeId) {
    try {
      const mode = this.getGameMode(modeId);
      if (!mode.unlockRequirement) return true;

      const playerLevel = await this.getPlayerLevel();
      
      switch (mode.unlockRequirement) {
        case 'level_5':
          return playerLevel >= 5;
        case 'level_10':
          return playerLevel >= 10;
        default:
          return true;
      }
    } catch (error) {
      console.error('Failed to check if mode is unlocked:', error);
      return false;
    }
  }

  /**
   * Get mode difficulty for current round (for survival mode)
   */
  getCurrentDifficulty(round) {
    if (round <= 5) return 'easy';
    if (round <= 10) return 'normal';
    if (round <= 20) return 'hard';
    return 'expert';
  }

  /**
   * Get time limit for current round (for survival mode)
   */
  getCurrentTimeLimit(round, baseTimeLimit = 30) {
    // Reduce time limit every 5 rounds
    const reduction = Math.floor(round / 5);
    return Math.max(10, baseTimeLimit - (reduction * 5));
  }

  /**
   * Calculate score for mode
   */
  calculateScore(modeId, gameData) {
    const mode = this.getGameMode(modeId);
    let score = gameData.baseScore || 0;

    switch (mode.scoring) {
      case 'speed_bonus':
        // Blitz mode: bonus for speed
        score *= mode.specialRules.scoreMultiplier || 1.5;
        if (gameData.averageSolveTime < 10) {
          score *= 1.2;
        }
        break;
      case 'survival_based':
        // Survival mode: bonus for rounds survived
        score += (gameData.roundsCompleted || 0) * 100;
        break;
      case 'tournament':
        // Tournament mode: win/lose based scoring
        score = gameData.won ? 1000 : 0;
        break;
      case 'learning_focused':
        // Zen mode: lower scores, focus on learning
        score *= 0.5;
        break;
      default:
        // Standard scoring
        break;
    }

    return Math.round(score);
  }

  /**
   * Load modes from storage
   */
  async loadModes() {
    try {
      const modes = await AsyncStorage.getItem('game_modes_data');
      if (modes) {
        const modesData = JSON.parse(modes);
        this.modes = new Map(modesData);
      }
    } catch (error) {
      console.error('Failed to load modes:', error);
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
export default new GameModeService();
