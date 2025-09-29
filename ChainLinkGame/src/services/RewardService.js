import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * RewardService - Reward distribution and management system
 * Handles daily rewards, milestone rewards, and special event rewards
 */
class RewardService {
  constructor() {
    this.isInitialized = false;
    this.rewardTypes = {
      coins: 'coins',
      hints: 'hints',
      lives: 'lives',
      themes: 'themes',
      avatars: 'avatars',
      xp: 'xp',
      boosters: 'boosters'
    };
    this.rewardSources = {
      daily: 'daily',
      milestone: 'milestone',
      achievement: 'achievement',
      seasonal: 'seasonal',
      event: 'event',
      purchase: 'purchase',
      ad: 'ad'
    };
    this.dailyRewards = {
      day1: { coins: 50, hints: 2 },
      day2: { coins: 75, hints: 3 },
      day3: { coins: 100, hints: 4 },
      day4: { coins: 125, hints: 5 },
      day5: { coins: 150, hints: 6 },
      day6: { coins: 200, hints: 8 },
      day7: { coins: 300, hints: 10, themes: ['weekly_bonus_theme'] }
    };
    this.milestoneRewards = {
      level5: { coins: 100, xp: 50 },
      level10: { coins: 200, xp: 100, hints: 5 },
      level15: { coins: 300, xp: 150, themes: ['level_15_theme'] },
      level20: { coins: 500, xp: 250, hints: 10, avatars: ['level_20_avatar'] },
      level25: { coins: 750, xp: 375, themes: ['level_25_theme'], avatars: ['level_25_avatar'] },
      level30: { coins: 1000, xp: 500, hints: 15, themes: ['level_30_theme'], avatars: ['level_30_avatar'] }
    };
    this.userRewards = {
      dailyStreak: 0,
      lastDailyReward: null,
      totalRewardsClaimed: 0,
      milestoneRewardsClaimed: [],
      specialRewardsClaimed: []
    };
  }

  /**
   * Initialize the reward service
   */
  async initialize() {
    try {
      console.log('RewardService: Initializing...');
      
      // Load user reward data
      await this.loadUserRewards();
      
      this.isInitialized = true;
      console.log('RewardService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('RewardService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check and claim daily reward
   */
  async claimDailyReward() {
    if (!this.isInitialized) {
      throw new Error('RewardService not initialized');
    }

    try {
      const now = new Date();
      const today = now.toDateString();
      const lastReward = this.userRewards.lastDailyReward;
      
      // Check if reward was already claimed today
      if (lastReward && new Date(lastReward).toDateString() === today) {
        throw new Error('Daily reward already claimed today');
      }

      // Calculate streak
      let streak = this.userRewards.dailyStreak;
      if (lastReward) {
        const lastRewardDate = new Date(lastReward);
        const daysDiff = Math.floor((now - lastRewardDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day - increase streak
          streak += 1;
        } else if (daysDiff > 1) {
          // Missed days - reset streak
          streak = 1;
        }
      } else {
        // First reward
        streak = 1;
      }

      // Get reward for current streak
      const rewardKey = `day${Math.min(streak, 7)}`;
      const baseReward = this.dailyRewards[rewardKey];
      
      // Apply streak bonus
      const streakBonus = Math.floor(streak / 7) * 0.1; // 10% bonus per week
      const reward = this.applyStreakBonus(baseReward, streakBonus);

      // Distribute rewards
      await this.distributeRewards(reward, this.rewardSources.daily);

      // Update user data
      this.userRewards.dailyStreak = streak;
      this.userRewards.lastDailyReward = now.toISOString();
      this.userRewards.totalRewardsClaimed += 1;

      await this.saveUserRewards();

      console.log(`RewardService: Daily reward claimed - Day ${streak}`);
      return {
        success: true,
        reward: reward,
        streak: streak,
        nextRewardTime: this.getNextDailyRewardTime()
      };
    } catch (error) {
      console.error('RewardService: Failed to claim daily reward:', error);
      throw error;
    }
  }

  /**
   * Apply streak bonus to rewards
   */
  applyStreakBonus(baseReward, bonusMultiplier) {
    const reward = { ...baseReward };
    
    if (reward.coins) {
      reward.coins = Math.floor(reward.coins * (1 + bonusMultiplier));
    }
    
    if (reward.hints) {
      reward.hints = Math.floor(reward.hints * (1 + bonusMultiplier));
    }
    
    if (reward.xp) {
      reward.xp = Math.floor(reward.xp * (1 + bonusMultiplier));
    }
    
    return reward;
  }

  /**
   * Get next daily reward time
   */
  getNextDailyRewardTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Check and claim milestone rewards
   */
  async claimMilestoneReward(milestone) {
    if (!this.isInitialized) {
      throw new Error('RewardService not initialized');
    }

    try {
      // Check if milestone reward was already claimed
      if (this.userRewards.milestoneRewardsClaimed.includes(milestone)) {
        throw new Error('Milestone reward already claimed');
      }

      const reward = this.milestoneRewards[milestone];
      if (!reward) {
        throw new Error('Invalid milestone');
      }

      // Distribute rewards
      await this.distributeRewards(reward, this.rewardSources.milestone);

      // Update user data
      this.userRewards.milestoneRewardsClaimed.push(milestone);
      this.userRewards.totalRewardsClaimed += 1;

      await this.saveUserRewards();

      console.log(`RewardService: Milestone reward claimed - ${milestone}`);
      return {
        success: true,
        reward: reward,
        milestone: milestone
      };
    } catch (error) {
      console.error('RewardService: Failed to claim milestone reward:', error);
      throw error;
    }
  }

  /**
   * Check for available milestone rewards
   */
  async checkMilestoneRewards(playerLevel) {
    const availableRewards = [];
    
    for (const [milestone, reward] of Object.entries(this.milestoneRewards)) {
      const level = parseInt(milestone.replace('level', ''));
      
      if (playerLevel >= level && !this.userRewards.milestoneRewardsClaimed.includes(milestone)) {
        availableRewards.push({
          milestone: milestone,
          reward: reward,
          level: level
        });
      }
    }
    
    return availableRewards;
  }

  /**
   * Give seasonal reward
   */
  async giveSeasonalReward(reward, source = 'seasonal') {
    if (!this.isInitialized) {
      throw new Error('RewardService not initialized');
    }

    try {
      // Distribute rewards
      await this.distributeRewards(reward, source);

      // Update user data
      this.userRewards.totalRewardsClaimed += 1;
      this.userRewards.specialRewardsClaimed.push({
        reward: reward,
        source: source,
        timestamp: Date.now()
      });

      await this.saveUserRewards();

      console.log(`RewardService: Seasonal reward given - ${source}`);
      return {
        success: true,
        reward: reward,
        source: source
      };
    } catch (error) {
      console.error('RewardService: Failed to give seasonal reward:', error);
      throw error;
    }
  }

  /**
   * Give event reward
   */
  async giveEventReward(reward, eventName) {
    if (!this.isInitialized) {
      throw new Error('RewardService not initialized');
    }

    try {
      // Distribute rewards
      await this.distributeRewards(reward, this.rewardSources.event);

      // Update user data
      this.userRewards.totalRewardsClaimed += 1;
      this.userRewards.specialRewardsClaimed.push({
        reward: reward,
        source: 'event',
        eventName: eventName,
        timestamp: Date.now()
      });

      await this.saveUserRewards();

      console.log(`RewardService: Event reward given - ${eventName}`);
      return {
        success: true,
        reward: reward,
        eventName: eventName
      };
    } catch (error) {
      console.error('RewardService: Failed to give event reward:', error);
      throw error;
    }
  }

  /**
   * Give achievement reward
   */
  async giveAchievementReward(reward, achievementId) {
    if (!this.isInitialized) {
      throw new Error('RewardService not initialized');
    }

    try {
      // Distribute rewards
      await this.distributeRewards(reward, this.rewardSources.achievement);

      // Update user data
      this.userRewards.totalRewardsClaimed += 1;
      this.userRewards.specialRewardsClaimed.push({
        reward: reward,
        source: 'achievement',
        achievementId: achievementId,
        timestamp: Date.now()
      });

      await this.saveUserRewards();

      console.log(`RewardService: Achievement reward given - ${achievementId}`);
      return {
        success: true,
        reward: reward,
        achievementId: achievementId
      };
    } catch (error) {
      console.error('RewardService: Failed to give achievement reward:', error);
      throw error;
    }
  }

  /**
   * Give ad reward
   */
  async giveAdReward(reward, adType) {
    if (!this.isInitialized) {
      throw new Error('RewardService not initialized');
    }

    try {
      // Distribute rewards
      await this.distributeRewards(reward, this.rewardSources.ad);

      // Update user data
      this.userRewards.totalRewardsClaimed += 1;
      this.userRewards.specialRewardsClaimed.push({
        reward: reward,
        source: 'ad',
        adType: adType,
        timestamp: Date.now()
      });

      await this.saveUserRewards();

      console.log(`RewardService: Ad reward given - ${adType}`);
      return {
        success: true,
        reward: reward,
        adType: adType
      };
    } catch (error) {
      console.error('RewardService: Failed to give ad reward:', error);
      throw error;
    }
  }

  /**
   * Distribute rewards to user account
   */
  async distributeRewards(reward, source) {
    for (const [type, amount] of Object.entries(reward)) {
      await this.giveReward(type, amount);
    }
  }

  /**
   * Give a specific reward
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
        case 'boosters':
          await this.addBoosters(amount);
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
      console.log(`RewardService: Added ${amount} coins`);
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
      console.log(`RewardService: Added ${amount} hints`);
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
      console.log(`RewardService: Added ${amount} lives`);
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
      console.log(`RewardService: Unlocked themes: ${newThemes.join(', ')}`);
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
      console.log(`RewardService: Unlocked avatars: ${newAvatars.join(', ')}`);
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
      console.log(`RewardService: Added ${amount} XP`);
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  }

  /**
   * Add boosters to player account
   */
  async addBoosters(amount) {
    try {
      const currentBoosters = await AsyncStorage.getItem('user_boosters');
      const newBoosters = (parseInt(currentBoosters) || 0) + amount;
      await AsyncStorage.setItem('user_boosters', newBoosters.toString());
      console.log(`RewardService: Added ${amount} boosters`);
    } catch (error) {
      console.error('Failed to add boosters:', error);
    }
  }

  /**
   * Get daily reward status
   */
  getDailyRewardStatus() {
    const now = new Date();
    const today = now.toDateString();
    const lastReward = this.userRewards.lastDailyReward;
    
    const canClaim = !lastReward || new Date(lastReward).toDateString() !== today;
    const streak = this.userRewards.dailyStreak;
    const nextRewardTime = this.getNextDailyRewardTime();
    
    return {
      canClaim: canClaim,
      streak: streak,
      nextRewardTime: nextRewardTime,
      lastClaimed: lastReward
    };
  }

  /**
   * Get reward statistics
   */
  getRewardStats() {
    return {
      totalRewardsClaimed: this.userRewards.totalRewardsClaimed,
      dailyStreak: this.userRewards.dailyStreak,
      milestoneRewardsClaimed: this.userRewards.milestoneRewardsClaimed.length,
      specialRewardsClaimed: this.userRewards.specialRewardsClaimed.length,
      lastDailyReward: this.userRewards.lastDailyReward
    };
  }

  /**
   * Get recent rewards
   */
  getRecentRewards(limit = 10) {
    return this.userRewards.specialRewardsClaimed
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Load user rewards from storage
   */
  async loadUserRewards() {
    try {
      const userRewards = await AsyncStorage.getItem('user_rewards');
      if (userRewards) {
        this.userRewards = { ...this.userRewards, ...JSON.parse(userRewards) };
      }
    } catch (error) {
      console.error('Failed to load user rewards:', error);
    }
  }

  /**
   * Save user rewards to storage
   */
  async saveUserRewards() {
    try {
      await AsyncStorage.setItem('user_rewards', JSON.stringify(this.userRewards));
    } catch (error) {
      console.error('Failed to save user rewards:', error);
    }
  }
}

export default RewardService;
