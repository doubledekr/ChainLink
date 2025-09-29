import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SeasonService - Season management system
 * Handles 6-week seasonal cycles, season transitions, and seasonal content
 */
class SeasonService {
  constructor() {
    this.currentSeason = null;
    this.seasons = new Map();
    this.isInitialized = false;
    this.seasonConfig = this.initializeSeasonConfig();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.loadSeasons();
      this.currentSeason = await this.getCurrentSeason();
      this.isInitialized = true;
      console.log('SeasonService initialized');
      return true;
    } catch (error) {
      console.error('SeasonService initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize season configuration
   */
  initializeSeasonConfig() {
    return {
      SEASON_LENGTH_WEEKS: 6,
      TOTAL_SEASONS_PER_YEAR: 8,
      SEASON_TRANSITION_DAY: 1, // Monday (0 = Sunday, 1 = Monday)
      SEASONS: [
        {
          id: 'winter_wonderland',
          name: 'Winter Wonderland',
          description: 'A magical winter experience with snowflakes and ice crystals',
          startMonth: 12,
          endMonth: 1,
          colors: {
            primary: '#4A90E2',
            secondary: '#87CEEB',
            accent: '#E3F2FD',
            background: '#F8F9FA'
          },
          particles: 'snowflakes',
          wordCategories: ['winter', 'holidays', 'cold', 'snow', 'ice'],
          music: 'winter_ambient',
          challenges: [
            {
              id: 'winter_streak',
              name: 'Winter Streak Master',
              description: 'Achieve a 15-word streak in winter theme',
              target: 15,
              reward: { coins: 200, xp: 100, theme: 'ice_crystal_tiles' }
            },
            {
              id: 'winter_words',
              name: 'Winter Vocabulary',
              description: 'Use 20 winter-themed words',
              target: 20,
              reward: { coins: 150, xp: 75, theme: 'snowflake_border' }
            }
          ]
        },
        {
          id: 'spring_bloom',
          name: 'Spring Bloom',
          description: 'Welcome spring with flowers and new beginnings',
          startMonth: 3,
          endMonth: 4,
          colors: {
            primary: '#4CAF50',
            secondary: '#81C784',
            accent: '#E8F5E8',
            background: '#F1F8E9'
          },
          particles: 'petals',
          wordCategories: ['spring', 'flowers', 'growth', 'nature', 'renewal'],
          music: 'spring_ambient',
          challenges: [
            {
              id: 'spring_growth',
              name: 'Spring Growth',
              description: 'Complete 25 games during spring season',
              target: 25,
              reward: { coins: 250, xp: 125, theme: 'flower_power' }
            },
            {
              id: 'spring_perfect',
              name: 'Spring Perfection',
              description: 'Achieve 5 perfect games in spring theme',
              target: 5,
              reward: { coins: 300, xp: 150, theme: 'rainbow_gradient' }
            }
          ]
        },
        {
          id: 'summer_heat',
          name: 'Summer Heat',
          description: 'Feel the warmth of summer with bright colors and energy',
          startMonth: 6,
          endMonth: 7,
          colors: {
            primary: '#FF6B6B',
            secondary: '#FFB74D',
            accent: '#FFF3E0',
            background: '#FFF8E1'
          },
          particles: 'sunshine',
          wordCategories: ['summer', 'beach', 'vacation', 'heat', 'fun'],
          music: 'summer_ambient',
          challenges: [
            {
              id: 'summer_speed',
              name: 'Summer Speed',
              description: 'Solve 30 puzzles under 15 seconds each',
              target: 30,
              reward: { coins: 350, xp: 175, theme: 'sunset_gradient' }
            },
            {
              id: 'summer_score',
              name: 'Summer High Score',
              description: 'Reach 2000 points in a single game',
              target: 2000,
              reward: { coins: 400, xp: 200, theme: 'tropical_vibes' }
            }
          ]
        },
        {
          id: 'autumn_harvest',
          name: 'Autumn Harvest',
          description: 'Embrace the beauty of autumn with warm colors',
          startMonth: 9,
          endMonth: 10,
          colors: {
            primary: '#FF8C00',
            secondary: '#FFB74D',
            accent: '#FFF3E0',
            background: '#FFF8E1'
          },
          particles: 'leaves',
          wordCategories: ['autumn', 'harvest', 'fall', 'leaves', 'cozy'],
          music: 'autumn_ambient',
          challenges: [
            {
              id: 'autumn_collection',
              name: 'Autumn Collection',
              description: 'Collect 50 seasonal rewards',
              target: 50,
              reward: { coins: 300, xp: 150, theme: 'autumn_leaves' }
            },
            {
              id: 'autumn_mastery',
              name: 'Autumn Mastery',
              description: 'Complete all autumn challenges',
              target: 1,
              reward: { coins: 500, xp: 250, title: 'Autumn Champion' }
            }
          ]
        }
      ]
    };
  }

  /**
   * Get current season based on date
   */
  async getCurrentSeason() {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      
      // Check if we have a stored current season
      const storedSeason = await AsyncStorage.getItem('current_season');
      if (storedSeason) {
        const seasonData = JSON.parse(storedSeason);
        if (seasonData.date === currentDate) {
          return seasonData.season;
        }
      }
      
      // Calculate current season
      const season = this.calculateCurrentSeason(now);
      
      // Store current season
      await AsyncStorage.setItem('current_season', JSON.stringify({
        date: currentDate,
        season: season
      }));
      
      return season;
    } catch (error) {
      console.error('Failed to get current season:', error);
      return this.seasonConfig.SEASONS[0]; // Default to first season
    }
  }

  /**
   * Calculate current season based on date
   */
  calculateCurrentSeason(date) {
    const month = date.getMonth() + 1; // JavaScript months are 0-based
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Simple season calculation based on month
    // This can be enhanced with more sophisticated logic
    if (month === 12 || month === 1 || month === 2) {
      return this.seasonConfig.SEASONS[0]; // Winter
    } else if (month >= 3 && month <= 5) {
      return this.seasonConfig.SEASONS[1]; // Spring
    } else if (month >= 6 && month <= 8) {
      return this.seasonConfig.SEASONS[2]; // Summer
    } else if (month >= 9 && month <= 11) {
      return this.seasonConfig.SEASONS[3]; // Autumn
    }
    
    return this.seasonConfig.SEASONS[0]; // Default to winter
  }

  /**
   * Get season by ID
   */
  getSeasonById(seasonId) {
    return this.seasonConfig.SEASONS.find(season => season.id === seasonId);
  }

  /**
   * Get season progress (0-100)
   */
  async getSeasonProgress() {
    try {
      const now = new Date();
      const season = await this.getCurrentSeason();
      
      // Calculate progress based on current date within season
      // This is a simplified calculation - can be enhanced
      const seasonStart = new Date(now.getFullYear(), this.getSeasonStartMonth(season), 1);
      const seasonEnd = new Date(now.getFullYear(), this.getSeasonEndMonth(season), 0);
      const totalDays = (seasonEnd - seasonStart) / (1000 * 60 * 60 * 24);
      const daysPassed = (now - seasonStart) / (1000 * 60 * 60 * 24);
      
      return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    } catch (error) {
      console.error('Failed to get season progress:', error);
      return 0;
    }
  }

  /**
   * Get season start month
   */
  getSeasonStartMonth(season) {
    return season.startMonth - 1; // Convert to 0-based
  }

  /**
   * Get season end month
   */
  getSeasonEndMonth(season) {
    return season.endMonth - 1; // Convert to 0-based
  }

  /**
   * Get days until season ends
   */
  async getDaysUntilSeasonEnds() {
    try {
      const now = new Date();
      const season = await this.getCurrentSeason();
      const seasonEnd = new Date(now.getFullYear(), this.getSeasonEndMonth(season), 0);
      const daysUntilEnd = Math.ceil((seasonEnd - now) / (1000 * 60 * 60 * 24));
      
      return Math.max(0, daysUntilEnd);
    } catch (error) {
      console.error('Failed to get days until season ends:', error);
      return 0;
    }
  }

  /**
   * Get seasonal challenges for current season
   */
  async getSeasonalChallenges() {
    try {
      const season = await this.getCurrentSeason();
      return season.challenges || [];
    } catch (error) {
      console.error('Failed to get seasonal challenges:', error);
      return [];
    }
  }

  /**
   * Get seasonal word categories
   */
  async getSeasonalWordCategories() {
    try {
      const season = await this.getCurrentSeason();
      return season.wordCategories || [];
    } catch (error) {
      console.error('Failed to get seasonal word categories:', error);
      return [];
    }
  }

  /**
   * Get seasonal theme colors
   */
  async getSeasonalTheme() {
    try {
      const season = await this.getCurrentSeason();
      return {
        colors: season.colors,
        particles: season.particles,
        music: season.music
      };
    } catch (error) {
      console.error('Failed to get seasonal theme:', error);
      return {
        colors: this.seasonConfig.SEASONS[0].colors,
        particles: 'default',
        music: 'default'
      };
    }
  }

  /**
   * Get season statistics
   */
  async getSeasonStats() {
    try {
      const seasonData = await AsyncStorage.getItem('season_stats');
      return seasonData ? JSON.parse(seasonData) : {
        gamesPlayed: 0,
        challengesCompleted: 0,
        rewardsEarned: 0,
        bestScore: 0,
        totalXP: 0
      };
    } catch (error) {
      console.error('Failed to get season stats:', error);
      return {
        gamesPlayed: 0,
        challengesCompleted: 0,
        rewardsEarned: 0,
        bestScore: 0,
        totalXP: 0
      };
    }
  }

  /**
   * Update season statistics
   */
  async updateSeasonStats(gameData) {
    try {
      const currentStats = await this.getSeasonStats();
      const updatedStats = {
        gamesPlayed: currentStats.gamesPlayed + 1,
        challengesCompleted: currentStats.challengesCompleted,
        rewardsEarned: currentStats.rewardsEarned,
        bestScore: Math.max(currentStats.bestScore, gameData.finalScore || 0),
        totalXP: currentStats.totalXP + (gameData.xpGained || 0)
      };
      
      await AsyncStorage.setItem('season_stats', JSON.stringify(updatedStats));
      return updatedStats;
    } catch (error) {
      console.error('Failed to update season stats:', error);
      return null;
    }
  }

  /**
   * Complete a seasonal challenge
   */
  async completeSeasonalChallenge(challengeId) {
    try {
      const completedChallenges = await this.getCompletedSeasonalChallenges();
      if (!completedChallenges.includes(challengeId)) {
        completedChallenges.push(challengeId);
        await AsyncStorage.setItem('completed_seasonal_challenges', JSON.stringify(completedChallenges));
        
        // Update season stats
        const currentStats = await this.getSeasonStats();
        await AsyncStorage.setItem('season_stats', JSON.stringify({
          ...currentStats,
          challengesCompleted: currentStats.challengesCompleted + 1
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to complete seasonal challenge:', error);
      return false;
    }
  }

  /**
   * Get completed seasonal challenges
   */
  async getCompletedSeasonalChallenges() {
    try {
      const completed = await AsyncStorage.getItem('completed_seasonal_challenges');
      return completed ? JSON.parse(completed) : [];
    } catch (error) {
      console.error('Failed to get completed seasonal challenges:', error);
      return [];
    }
  }

  /**
   * Check if season has changed
   */
  async hasSeasonChanged() {
    try {
      const storedSeason = await AsyncStorage.getItem('current_season');
      const currentSeason = await this.getCurrentSeason();
      
      if (!storedSeason) return true;
      
      const storedData = JSON.parse(storedSeason);
      return storedData.season.id !== currentSeason.id;
    } catch (error) {
      console.error('Failed to check if season changed:', error);
      return true;
    }
  }

  /**
   * Reset for new season
   */
  async resetForNewSeason() {
    try {
      // Clear completed challenges
      await AsyncStorage.removeItem('completed_seasonal_challenges');
      
      // Reset season stats
      await AsyncStorage.setItem('season_stats', JSON.stringify({
        gamesPlayed: 0,
        challengesCompleted: 0,
        rewardsEarned: 0,
        bestScore: 0,
        totalXP: 0
      }));
      
      console.log('Reset for new season');
      return true;
    } catch (error) {
      console.error('Failed to reset for new season:', error);
      return false;
    }
  }

  /**
   * Load seasons from storage
   */
  async loadSeasons() {
    try {
      const seasons = await AsyncStorage.getItem('seasons_data');
      if (seasons) {
        const seasonsData = JSON.parse(seasons);
        this.seasons = new Map(seasonsData);
      }
    } catch (error) {
      console.error('Failed to load seasons:', error);
    }
  }

  /**
   * Get all available seasons
   */
  getAllSeasons() {
    return this.seasonConfig.SEASONS;
  }

  /**
   * Get season configuration
   */
  getSeasonConfig() {
    return this.seasonConfig;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized() {
    return this.isInitialized;
  }
}

// Export singleton instance
export default new SeasonService();
