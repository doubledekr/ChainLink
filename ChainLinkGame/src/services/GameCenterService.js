import { Platform } from 'react-native';
import GameCenter from 'react-native-game-center';

/**
 * GameCenterService - iOS Game Center integration
 * Handles authentication, score submission, and leaderboard data fetching
 */
class GameCenterService {
  constructor() {
    this.isAuthenticated = false;
    this.playerId = null;
    this.playerAlias = null;
  }

  /**
   * Initialize Game Center and authenticate the player
   * @returns {Promise<boolean>} - Authentication success
   */
  async initialize() {
    try {
      if (Platform.OS !== 'ios') {
        console.log('Game Center is iOS only');
        return false;
      }

      // Check if Game Center is available
      if (!GameCenter || typeof GameCenter.isAvailable !== 'function') {
        console.log('Game Center library not properly installed or configured');
        return false;
      }

      const isAvailable = await GameCenter.isAvailable();
      if (!isAvailable) {
        console.log('Game Center is not available on this device');
        return false;
      }

      // Authenticate the player
      const player = await GameCenter.authenticatePlayer();
      if (player) {
        this.isAuthenticated = true;
        this.playerId = player.playerID;
        this.playerAlias = player.alias;
        console.log('Game Center authenticated:', player.alias);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Game Center initialization failed:', error);
      return false;
    }
  }

  /**
   * Submit score to a specific leaderboard
   * @param {string} leaderboardId - The leaderboard identifier
   * @param {number} score - The score to submit
   * @returns {Promise<boolean>} - Submission success
   */
  async submitScore(leaderboardId, score) {
    try {
      if (!this.isAuthenticated) {
        console.log('Game Center not authenticated');
        return false;
      }

      await GameCenter.submitScore(leaderboardId, score);
      console.log(`Score ${score} submitted to leaderboard ${leaderboardId}`);
      return true;
    } catch (error) {
      console.error('Failed to submit score:', error);
      return false;
    }
  }

  /**
   * Submit achievement progress
   * @param {string} achievementId - The achievement identifier
   * @param {number} percentComplete - Percentage complete (0-100)
   * @returns {Promise<boolean>} - Submission success
   */
  async submitAchievement(achievementId, percentComplete) {
    try {
      if (!this.isAuthenticated) {
        console.log('Game Center not authenticated');
        return false;
      }

      await GameCenter.submitAchievement(achievementId, percentComplete);
      console.log(`Achievement ${achievementId} progress: ${percentComplete}%`);
      return true;
    } catch (error) {
      console.error('Failed to submit achievement:', error);
      return false;
    }
  }

  /**
   * Get leaderboard data
   * @param {string} leaderboardId - The leaderboard identifier
   * @param {number} timeScope - Time scope (0=all time, 1=week, 2=today)
   * @param {number} playerScope - Player scope (0=global, 1=friends)
   * @returns {Promise<Array>} - Leaderboard entries
   */
  async getLeaderboard(leaderboardId, timeScope = 0, playerScope = 0) {
    try {
      if (!this.isAuthenticated) {
        console.log('Game Center not authenticated');
        return [];
      }

      const entries = await GameCenter.getLeaderboard(leaderboardId, {
        timeScope,
        playerScope,
        range: { location: 1, length: 100 } // Top 100
      });

      return entries.map(entry => ({
        rank: entry.rank,
        playerId: entry.playerID,
        playerAlias: entry.alias,
        score: entry.score,
        date: entry.date,
        isCurrentPlayer: entry.playerID === this.playerId
      }));
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
      if (!this.isAuthenticated) {
        return null;
      }

      const score = await GameCenter.getPlayerScore(leaderboardId);
      return score ? {
        score: score.score,
        rank: score.rank,
        date: score.date
      } : null;
    } catch (error) {
      console.error('Failed to get player score:', error);
      return null;
    }
  }

  /**
   * Show Game Center leaderboard UI
   * @param {string} leaderboardId - The leaderboard identifier to show
   */
  async showLeaderboard(leaderboardId) {
    try {
      if (!this.isAuthenticated) {
        console.log('Game Center not authenticated');
        return;
      }

      await GameCenter.showLeaderboard(leaderboardId);
    } catch (error) {
      console.error('Failed to show leaderboard:', error);
    }
  }

  /**
   * Show Game Center achievements UI
   */
  async showAchievements() {
    try {
      if (!this.isAuthenticated) {
        console.log('Game Center not authenticated');
        return;
      }

      await GameCenter.showAchievements();
    } catch (error) {
      console.error('Failed to show achievements:', error);
    }
  }

  /**
   * Get player information
   * @returns {Object} - Player data
   */
  getPlayerInfo() {
    return {
      isAuthenticated: this.isAuthenticated,
      playerId: this.playerId,
      playerAlias: this.playerAlias
    };
  }

  /**
   * Submit ChainLink specific scores
   * @param {Object} gameData - Game data object
   */
  async submitGameScores(gameData) {
    const scores = [];

    // High Score leaderboard
    if (gameData.finalScore > 0) {
      scores.push(
        this.submitScore('chainlink.highscore', gameData.finalScore)
      );
    }

    // Weekly Score leaderboard (if it's a new week)
    if (gameData.weeklyScore > 0) {
      scores.push(
        this.submitScore('chainlink.weeklyscore', gameData.weeklyScore)
      );
    }

    // Streak Record leaderboard
    if (gameData.streakRecord > 0) {
      scores.push(
        this.submitScore('chainlink.streakrecord', gameData.streakRecord)
      );
    }

    // Wait for all submissions to complete
    const results = await Promise.allSettled(scores);
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
    
    console.log(`Submitted ${successCount}/${scores.length} scores to Game Center`);
    return successCount === scores.length;
  }

  /**
   * Submit ChainLink specific achievements
   * @param {Object} stats - Player statistics
   */
  async submitGameAchievements(stats) {
    const achievements = [];

    // First Win
    if (stats.gamesWon >= 1) {
      achievements.push(
        this.submitAchievement('chainlink.first_win', 100)
      );
    }

    // Streak Master
    if (stats.maxStreak >= 10) {
      achievements.push(
        this.submitAchievement('chainlink.streak_master_10', 100)
      );
    }

    // Perfect Game
    if (stats.perfectGames >= 1) {
      achievements.push(
        this.submitAchievement('chainlink.perfect_game', 100)
      );
    }

    // Multiplayer Champion
    if (stats.multiplayerWins >= 50) {
      achievements.push(
        this.submitAchievement('chainlink.multiplayer_champion', 100)
      );
    }

    // Wait for all submissions to complete
    const results = await Promise.allSettled(achievements);
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
    
    console.log(`Submitted ${successCount}/${achievements.length} achievements to Game Center`);
    return successCount === achievements.length;
  }
}

// Export singleton instance
export default new GameCenterService();
