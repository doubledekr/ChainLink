import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * AchievementService - Achievement tracking and reward distribution system
 * Handles achievement unlocking, progress tracking, and Game Center integration
 */
class AchievementService {
  constructor() {
    this.isInitialized = false;
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.achievementCategories = {
      gameplay: 'Gameplay',
      progression: 'Progression',
      social: 'Social',
      collection: 'Collection',
      special: 'Special',
      seasonal: 'Seasonal'
    };
    this.rewardTypes = {
      coins: 'coins',
      hints: 'hints',
      lives: 'lives',
      themes: 'themes',
      avatars: 'avatars',
      badges: 'badges',
      xp: 'xp'
    };
    this.initializeAchievements();
  }

  /**
   * Initialize the achievement service
   */
  async initialize() {
    try {
      console.log('AchievementService: Initializing...');
      
      // Load user achievement progress
      await this.loadUserAchievements();
      
      // Initialize Game Center integration (iOS only)
      if (Platform.OS === 'ios') {
        await this.initializeGameCenter();
      }
      
      this.isInitialized = true;
      console.log('AchievementService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('AchievementService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize Game Center integration
   */
  async initializeGameCenter() {
    try {
      // In a real implementation, this would initialize Game Center
      console.log('AchievementService: Game Center integration initialized');
      return true;
    } catch (error) {
      console.error('AchievementService: Game Center initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize all available achievements
   */
  initializeAchievements() {
    // Gameplay Achievements
    this.addAchievement('first_word', {
      id: 'first_word',
      name: 'First Word',
      description: 'Complete your first word puzzle',
      category: 'gameplay',
      icon: 'bulb',
      color: '#4CAF50',
      rarity: 'common',
      points: 10,
      requirements: {
        puzzlesCompleted: 1
      },
      rewards: {
        coins: 50,
        xp: 25
      },
      hidden: false
    });

    this.addAchievement('word_master', {
      id: 'word_master',
      name: 'Word Master',
      description: 'Complete 100 word puzzles',
      category: 'gameplay',
      icon: 'trophy',
      color: '#FFD700',
      rarity: 'rare',
      points: 50,
      requirements: {
        puzzlesCompleted: 100
      },
      rewards: {
        coins: 200,
        xp: 100,
        themes: ['word_master_theme']
      },
      hidden: false
    });

    this.addAchievement('speed_demon', {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a puzzle in under 10 seconds',
      category: 'gameplay',
      icon: 'flash',
      color: '#FF6B6B',
      rarity: 'epic',
      points: 75,
      requirements: {
        fastestTime: 10
      },
      rewards: {
        coins: 300,
        xp: 150,
        hints: 10
      },
      hidden: false
    });

    this.addAchievement('perfectionist', {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete 10 puzzles without using any hints',
      category: 'gameplay',
      icon: 'star',
      color: '#9C27B0',
      rarity: 'legendary',
      points: 100,
      requirements: {
        perfectGames: 10
      },
      rewards: {
        coins: 500,
        xp: 250,
        themes: ['perfectionist_theme'],
        avatars: ['perfectionist_avatar']
      },
      hidden: false
    });

    // Progression Achievements
    this.addAchievement('level_up', {
      id: 'level_up',
      name: 'Level Up',
      description: 'Reach level 5',
      category: 'progression',
      icon: 'trending-up',
      color: '#2196F3',
      rarity: 'common',
      points: 25,
      requirements: {
        playerLevel: 5
      },
      rewards: {
        coins: 100,
        xp: 50
      },
      hidden: false
    });

    this.addAchievement('high_scorer', {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Score 1000 points in a single game',
      category: 'progression',
      icon: 'medal',
      color: '#FF9800',
      rarity: 'rare',
      points: 50,
      requirements: {
        bestScore: 1000
      },
      rewards: {
        coins: 250,
        xp: 125
      },
      hidden: false
    });

    this.addAchievement('streak_master', {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Achieve a 20-game winning streak',
      category: 'progression',
      icon: 'flame',
      color: '#FF5722',
      rarity: 'epic',
      points: 75,
      requirements: {
        bestStreak: 20
      },
      rewards: {
        coins: 400,
        xp: 200,
        hints: 15
      },
      hidden: false
    });

    // Social Achievements
    this.addAchievement('social_butterfly', {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Share your score 5 times',
      category: 'social',
      icon: 'share',
      color: '#4CAF50',
      rarity: 'common',
      points: 20,
      requirements: {
        sharesCount: 5
      },
      rewards: {
        coins: 75,
        xp: 40
      },
      hidden: false
    });

    this.addAchievement('leaderboard_champion', {
      id: 'leaderboard_champion',
      name: 'Leaderboard Champion',
      description: 'Reach top 10 on any leaderboard',
      category: 'social',
      icon: 'podium',
      color: '#FFD700',
      rarity: 'rare',
      points: 60,
      requirements: {
        topLeaderboardPosition: 10
      },
      rewards: {
        coins: 300,
        xp: 150,
        themes: ['champion_theme']
      },
      hidden: false
    });

    // Collection Achievements
    this.addAchievement('theme_collector', {
      id: 'theme_collector',
      name: 'Theme Collector',
      description: 'Unlock 10 different themes',
      category: 'collection',
      icon: 'color-palette',
      color: '#9C27B0',
      rarity: 'rare',
      points: 40,
      requirements: {
        themesUnlocked: 10
      },
      rewards: {
        coins: 200,
        xp: 100,
        themes: ['collector_theme']
      },
      hidden: false
    });

    this.addAchievement('avatar_master', {
      id: 'avatar_master',
      name: 'Avatar Master',
      description: 'Unlock 5 different avatars',
      category: 'collection',
      icon: 'person',
      color: '#2196F3',
      rarity: 'common',
      points: 30,
      requirements: {
        avatarsUnlocked: 5
      },
      rewards: {
        coins: 150,
        xp: 75,
        avatars: ['master_avatar']
      },
      hidden: false
    });

    // Special Achievements
    this.addAchievement('early_bird', {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Play the game for 7 consecutive days',
      category: 'special',
      icon: 'sunny',
      color: '#FFD700',
      rarity: 'epic',
      points: 80,
      requirements: {
        consecutiveDays: 7
      },
      rewards: {
        coins: 350,
        xp: 175,
        hints: 20,
        themes: ['early_bird_theme']
      },
      hidden: false
    });

    this.addAchievement('night_owl', {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Play the game between 11 PM and 6 AM',
      category: 'special',
      icon: 'moon',
      color: '#673AB7',
      rarity: 'rare',
      points: 45,
      requirements: {
        nightPlaySessions: 10
      },
      rewards: {
        coins: 200,
        xp: 100,
        themes: ['night_owl_theme']
      },
      hidden: false
    });

    // Seasonal Achievements
    this.addAchievement('holiday_cheer', {
      id: 'holiday_cheer',
      name: 'Holiday Cheer',
      description: 'Complete a holiday-themed challenge',
      category: 'seasonal',
      icon: 'gift',
      color: '#E91E63',
      rarity: 'epic',
      points: 70,
      requirements: {
        holidayChallengesCompleted: 1
      },
      rewards: {
        coins: 300,
        xp: 150,
        themes: ['holiday_theme'],
        avatars: ['holiday_avatar']
      },
      hidden: false
    });

    // Hidden Achievements
    this.addAchievement('secret_achiever', {
      id: 'secret_achiever',
      name: 'Secret Achiever',
      description: 'Discover this hidden achievement',
      category: 'special',
      icon: 'lock-closed',
      color: '#607D8B',
      rarity: 'legendary',
      points: 150,
      requirements: {
        secretActions: 1
      },
      rewards: {
        coins: 1000,
        xp: 500,
        themes: ['secret_theme'],
        avatars: ['secret_avatar']
      },
      hidden: true
    });
  }

  /**
   * Add an achievement to the system
   */
  addAchievement(id, achievement) {
    this.achievements.set(id, {
      ...achievement,
      id: id,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    });
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Array.from(this.achievements.values());
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category) {
    return this.getAllAchievements().filter(achievement => 
      achievement.category === category
    );
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    return this.getAllAchievements().filter(achievement => 
      achievement.unlocked
    );
  }

  /**
   * Get locked achievements
   */
  getLockedAchievements() {
    return this.getAllAchievements().filter(achievement => 
      !achievement.unlocked
    );
  }

  /**
   * Get achievement by ID
   */
  getAchievement(id) {
    return this.achievements.get(id);
  }

  /**
   * Check if achievement is unlocked
   */
  isAchievementUnlocked(id) {
    const achievement = this.getAchievement(id);
    return achievement ? achievement.unlocked : false;
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(id, progress) {
    const achievement = this.getAchievement(id);
    if (!achievement) return false;

    // Update progress
    achievement.progress = Math.max(achievement.progress, progress);

    // Check if achievement should be unlocked
    if (!achievement.unlocked && this.checkAchievementRequirements(achievement)) {
      await this.unlockAchievement(id);
      return true;
    }

    // Save progress
    await this.saveUserAchievements();
    return false;
  }

  /**
   * Check if achievement requirements are met
   */
  checkAchievementRequirements(achievement) {
    const requirements = achievement.requirements;
    
    for (const [key, value] of Object.entries(requirements)) {
      // Get current progress for this requirement
      const currentProgress = this.getCurrentProgress(key);
      
      if (currentProgress < value) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get current progress for a requirement
   */
  getCurrentProgress(requirement) {
    // In a real implementation, this would get actual game data
    // For now, we'll simulate progress based on requirement type
    switch (requirement) {
      case 'puzzlesCompleted':
        return Math.floor(Math.random() * 150); // Simulate progress
      case 'playerLevel':
        return Math.floor(Math.random() * 20);
      case 'bestScore':
        return Math.floor(Math.random() * 2000);
      case 'bestStreak':
        return Math.floor(Math.random() * 30);
      case 'perfectGames':
        return Math.floor(Math.random() * 15);
      case 'fastestTime':
        return Math.floor(Math.random() * 20);
      case 'sharesCount':
        return Math.floor(Math.random() * 10);
      case 'topLeaderboardPosition':
        return Math.floor(Math.random() * 20);
      case 'themesUnlocked':
        return Math.floor(Math.random() * 15);
      case 'avatarsUnlocked':
        return Math.floor(Math.random() * 8);
      case 'consecutiveDays':
        return Math.floor(Math.random() * 10);
      case 'nightPlaySessions':
        return Math.floor(Math.random() * 15);
      case 'holidayChallengesCompleted':
        return Math.floor(Math.random() * 3);
      case 'secretActions':
        return Math.floor(Math.random() * 2);
      default:
        return 0;
    }
  }

  /**
   * Unlock an achievement
   */
  async unlockAchievement(id) {
    const achievement = this.getAchievement(id);
    if (!achievement || achievement.unlocked) return false;

    // Mark as unlocked
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();

    // Distribute rewards
    await this.distributeRewards(achievement);

    // Report to Game Center (iOS)
    if (Platform.OS === 'ios') {
      await this.reportAchievementToGameCenter(id);
    }

    // Save progress
    await this.saveUserAchievements();

    console.log(`AchievementService: Achievement unlocked - ${achievement.name}`);
    return true;
  }

  /**
   * Distribute achievement rewards
   */
  async distributeRewards(achievement) {
    const rewards = achievement.rewards;
    
    for (const [type, amount] of Object.entries(rewards)) {
      await this.giveReward(type, amount);
    }
  }

  /**
   * Give a reward to the player
   */
  async giveReward(type, amount) {
    try {
      switch (type) {
        case 'coins':
          await this.addCoins(amount);
          break;
        case 'hints':
          await this.addHints(amount);
          break;
        case 'lives':
          await this.addLives(amount);
          break;
        case 'themes':
          await this.unlockThemes(amount);
          break;
        case 'avatars':
          await this.unlockAvatars(amount);
          break;
        case 'xp':
          await this.addXP(amount);
          break;
        default:
          console.log(`Unknown reward type: ${type}`);
      }
    } catch (error) {
      console.error(`Failed to give reward ${type}:`, error);
    }
  }

  /**
   * Add coins to player account
   */
  async addCoins(amount) {
    try {
      const currentCoins = await AsyncStorage.getItem('user_coins');
      const newCoins = (parseInt(currentCoins) || 0) + amount;
      await AsyncStorage.setItem('user_coins', newCoins.toString());
      console.log(`AchievementService: Added ${amount} coins`);
    } catch (error) {
      console.error('Failed to add coins:', error);
    }
  }

  /**
   * Add hints to player account
   */
  async addHints(amount) {
    try {
      const currentHints = await AsyncStorage.getItem('user_hints');
      const newHints = (parseInt(currentHints) || 0) + amount;
      await AsyncStorage.setItem('user_hints', newHints.toString());
      console.log(`AchievementService: Added ${amount} hints`);
    } catch (error) {
      console.error('Failed to add hints:', error);
    }
  }

  /**
   * Add lives to player account
   */
  async addLives(amount) {
    try {
      const currentLives = await AsyncStorage.getItem('user_lives');
      const newLives = (parseInt(currentLives) || 0) + amount;
      await AsyncStorage.setItem('user_lives', newLives.toString());
      console.log(`AchievementService: Added ${amount} lives`);
    } catch (error) {
      console.error('Failed to add lives:', error);
    }
  }

  /**
   * Unlock themes
   */
  async unlockThemes(themes) {
    try {
      const unlockedThemes = await AsyncStorage.getItem('unlocked_themes');
      const themeList = unlockedThemes ? JSON.parse(unlockedThemes) : [];
      
      const newThemes = Array.isArray(themes) ? themes : [themes];
      newThemes.forEach(theme => {
        if (!themeList.includes(theme)) {
          themeList.push(theme);
        }
      });
      
      await AsyncStorage.setItem('unlocked_themes', JSON.stringify(themeList));
      console.log(`AchievementService: Unlocked themes: ${newThemes.join(', ')}`);
    } catch (error) {
      console.error('Failed to unlock themes:', error);
    }
  }

  /**
   * Unlock avatars
   */
  async unlockAvatars(avatars) {
    try {
      const unlockedAvatars = await AsyncStorage.getItem('unlocked_avatars');
      const avatarList = unlockedAvatars ? JSON.parse(unlockedAvatars) : [];
      
      const newAvatars = Array.isArray(avatars) ? avatars : [avatars];
      newAvatars.forEach(avatar => {
        if (!avatarList.includes(avatar)) {
          avatarList.push(avatar);
        }
      });
      
      await AsyncStorage.setItem('unlocked_avatars', JSON.stringify(avatarList));
      console.log(`AchievementService: Unlocked avatars: ${newAvatars.join(', ')}`);
    } catch (error) {
      console.error('Failed to unlock avatars:', error);
    }
  }

  /**
   * Add XP to player account
   */
  async addXP(amount) {
    try {
      const currentXP = await AsyncStorage.getItem('user_xp');
      const newXP = (parseInt(currentXP) || 0) + amount;
      await AsyncStorage.setItem('user_xp', newXP.toString());
      console.log(`AchievementService: Added ${amount} XP`);
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  }

  /**
   * Report achievement to Game Center
   */
  async reportAchievementToGameCenter(achievementId) {
    try {
      // In a real implementation, this would report to Game Center
      console.log(`AchievementService: Reported achievement ${achievementId} to Game Center`);
      return true;
    } catch (error) {
      console.error('Failed to report achievement to Game Center:', error);
      return false;
    }
  }

  /**
   * Load user achievements from storage
   */
  async loadUserAchievements() {
    try {
      const userAchievements = await AsyncStorage.getItem('user_achievements');
      if (userAchievements) {
        const achievements = JSON.parse(userAchievements);
        
        // Merge with default achievements
        for (const [id, achievement] of achievements) {
          if (this.achievements.has(id)) {
            this.achievements.set(id, { ...this.achievements.get(id), ...achievement });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user achievements:', error);
    }
  }

  /**
   * Save user achievements to storage
   */
  async saveUserAchievements() {
    try {
      const achievements = Array.from(this.achievements.entries());
      await AsyncStorage.setItem('user_achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('Failed to save user achievements:', error);
    }
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats() {
    const allAchievements = this.getAllAchievements();
    const unlocked = this.getUnlockedAchievements();
    
    return {
      total: allAchievements.length,
      unlocked: unlocked.length,
      locked: allAchievements.length - unlocked.length,
      totalPoints: unlocked.reduce((sum, achievement) => sum + achievement.points, 0),
      categories: this.achievementCategories
    };
  }

  /**
   * Get recent achievements
   */
  getRecentAchievements(limit = 5) {
    return this.getUnlockedAchievements()
      .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
      .slice(0, limit);
  }

  /**
   * Check for new achievements based on game data
   */
  async checkForNewAchievements(gameData) {
    const newAchievements = [];
    
    // Check all locked achievements
    const lockedAchievements = this.getLockedAchievements();
    
    for (const achievement of lockedAchievements) {
      if (this.checkAchievementRequirements(achievement)) {
        await this.unlockAchievement(achievement.id);
        newAchievements.push(achievement);
      }
    }
    
    return newAchievements;
  }
}

export default AchievementService;
