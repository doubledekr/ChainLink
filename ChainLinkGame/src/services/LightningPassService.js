import AsyncStorage from '@react-native-async-storage/async-storage';
import IAPService from './IAPService';

/**
 * LightningPassService - Premium subscription management
 * Handles Lightning Pass features, benefits, and user experience
 */
class LightningPassService {
  constructor() {
    this.isInitialized = false;
    this.iapService = new IAPService();
    this.lightningPassFeatures = {
      noAds: true,
      premiumThemes: true,
      exclusiveContent: true,
      prioritySupport: true,
      bonusCoins: 100, // Daily bonus coins
      exclusiveChallenges: true,
      earlyAccess: true,
      customAvatars: true,
      advancedStats: true,
      cloudSave: true
    };
    this.userBenefits = {
      dailyBonus: {
        coins: 100,
        hints: 5,
        lastClaimed: null
      },
      exclusiveThemes: [],
      exclusiveChallenges: [],
      premiumAvatars: [],
      cloudSaveEnabled: false
    };
  }

  /**
   * Initialize the Lightning Pass service
   */
  async initialize() {
    try {
      console.log('LightningPassService: Initializing...');
      
      // Initialize IAP service
      await this.iapService.initialize();
      
      // Load user benefits
      await this.loadUserBenefits();
      
      // Check subscription status
      await this.checkSubscriptionStatus();
      
      this.isInitialized = true;
      console.log('LightningPassService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('LightningPassService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if user has active Lightning Pass
   */
  async hasActiveLightningPass() {
    try {
      const subscriptionStatus = await this.iapService.checkSubscriptionStatus();
      return subscriptionStatus.lightningPass;
    } catch (error) {
      console.error('LightningPassService: Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Get Lightning Pass features
   */
  getLightningPassFeatures() {
    return { ...this.lightningPassFeatures };
  }

  /**
   * Get user benefits
   */
  getUserBenefits() {
    return { ...this.userBenefits };
  }

  /**
   * Claim daily bonus
   */
  async claimDailyBonus() {
    try {
      const hasPass = await this.hasActiveLightningPass();
      if (!hasPass) {
        throw new Error('Lightning Pass required for daily bonus');
      }

      const now = Date.now();
      const lastClaimed = this.userBenefits.dailyBonus.lastClaimed;
      
      // Check if bonus was already claimed today
      if (lastClaimed) {
        const lastClaimedDate = new Date(lastClaimed);
        const today = new Date();
        
        if (lastClaimedDate.toDateString() === today.toDateString()) {
          throw new Error('Daily bonus already claimed today');
        }
      }

      // Award bonus
      const bonus = this.userBenefits.dailyBonus;
      
      // Add coins
      await this.addCoins(bonus.coins);
      
      // Add hints
      await this.addHints(bonus.hints);
      
      // Update last claimed time
      this.userBenefits.dailyBonus.lastClaimed = now;
      await this.saveUserBenefits();
      
      console.log(`LightningPassService: Daily bonus claimed - ${bonus.coins} coins, ${bonus.hints} hints`);
      
      return {
        success: true,
        coins: bonus.coins,
        hints: bonus.hints,
        nextClaimTime: this.getNextClaimTime()
      };
    } catch (error) {
      console.error('LightningPassService: Failed to claim daily bonus:', error);
      throw error;
    }
  }

  /**
   * Get next claim time for daily bonus
   */
  getNextClaimTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Unlock exclusive theme
   */
  async unlockExclusiveTheme(themeId) {
    try {
      const hasPass = await this.hasActiveLightningPass();
      if (!hasPass) {
        throw new Error('Lightning Pass required for exclusive themes');
      }

      if (!this.userBenefits.exclusiveThemes.includes(themeId)) {
        this.userBenefits.exclusiveThemes.push(themeId);
        await this.saveUserBenefits();
        
        console.log(`LightningPassService: Exclusive theme unlocked - ${themeId}`);
        return { success: true, themeId: themeId };
      } else {
        return { success: false, message: 'Theme already unlocked' };
      }
    } catch (error) {
      console.error('LightningPassService: Failed to unlock exclusive theme:', error);
      throw error;
    }
  }

  /**
   * Unlock exclusive challenge
   */
  async unlockExclusiveChallenge(challengeId) {
    try {
      const hasPass = await this.hasActiveLightningPass();
      if (!hasPass) {
        throw new Error('Lightning Pass required for exclusive challenges');
      }

      if (!this.userBenefits.exclusiveChallenges.includes(challengeId)) {
        this.userBenefits.exclusiveChallenges.push(challengeId);
        await this.saveUserBenefits();
        
        console.log(`LightningPassService: Exclusive challenge unlocked - ${challengeId}`);
        return { success: true, challengeId: challengeId };
      } else {
        return { success: false, message: 'Challenge already unlocked' };
      }
    } catch (error) {
      console.error('LightningPassService: Failed to unlock exclusive challenge:', error);
      throw error;
    }
  }

  /**
   * Unlock premium avatar
   */
  async unlockPremiumAvatar(avatarId) {
    try {
      const hasPass = await this.hasActiveLightningPass();
      if (!hasPass) {
        throw new Error('Lightning Pass required for premium avatars');
      }

      if (!this.userBenefits.premiumAvatars.includes(avatarId)) {
        this.userBenefits.premiumAvatars.push(avatarId);
        await this.saveUserBenefits();
        
        console.log(`LightningPassService: Premium avatar unlocked - ${avatarId}`);
        return { success: true, avatarId: avatarId };
      } else {
        return { success: false, message: 'Avatar already unlocked' };
      }
    } catch (error) {
      console.error('LightningPassService: Failed to unlock premium avatar:', error);
      throw error;
    }
  }

  /**
   * Enable cloud save
   */
  async enableCloudSave() {
    try {
      const hasPass = await this.hasActiveLightningPass();
      if (!hasPass) {
        throw new Error('Lightning Pass required for cloud save');
      }

      this.userBenefits.cloudSaveEnabled = true;
      await this.saveUserBenefits();
      
      console.log('LightningPassService: Cloud save enabled');
      return { success: true };
    } catch (error) {
      console.error('LightningPassService: Failed to enable cloud save:', error);
      throw error;
    }
  }

  /**
   * Get exclusive content
   */
  getExclusiveContent() {
    return {
      themes: this.userBenefits.exclusiveThemes,
      challenges: this.userBenefits.exclusiveChallenges,
      avatars: this.userBenefits.premiumAvatars,
      cloudSave: this.userBenefits.cloudSaveEnabled
    };
  }

  /**
   * Check if feature is available
   */
  async isFeatureAvailable(feature) {
    const hasPass = await this.hasActiveLightningPass();
    return hasPass && this.lightningPassFeatures[feature];
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus() {
    try {
      const subscriptionStatus = await this.iapService.checkSubscriptionStatus();
      const hasPass = subscriptionStatus.lightningPass;
      
      return {
        hasPass: hasPass,
        expiryDate: subscriptionStatus.expiryDate,
        autoRenew: subscriptionStatus.autoRenew,
        daysRemaining: hasPass ? this.getDaysRemaining(subscriptionStatus.expiryDate) : 0
      };
    } catch (error) {
      console.error('LightningPassService: Failed to get subscription status:', error);
      return {
        hasPass: false,
        expiryDate: null,
        autoRenew: false,
        daysRemaining: 0
      };
    }
  }

  /**
   * Get days remaining in subscription
   */
  getDaysRemaining(expiryDate) {
    if (!expiryDate) return 0;
    
    const now = Date.now();
    const remaining = expiryDate - now;
    return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)));
  }

  /**
   * Subscribe to Lightning Pass
   */
  async subscribeToLightningPass(planId) {
    try {
      const result = await this.iapService.subscribeToLightningPass(planId);
      
      if (result.success) {
        // Initialize benefits for new subscriber
        await this.initializeNewSubscriberBenefits();
        
        console.log('LightningPassService: Successfully subscribed to Lightning Pass');
        return result;
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('LightningPassService: Failed to subscribe:', error);
      throw error;
    }
  }

  /**
   * Cancel Lightning Pass subscription
   */
  async cancelLightningPassSubscription() {
    try {
      const result = await this.iapService.cancelSubscription();
      
      if (result.success) {
        // Disable benefits
        await this.disableBenefits();
        
        console.log('LightningPassService: Lightning Pass subscription cancelled');
        return result;
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (error) {
      console.error('LightningPassService: Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Initialize benefits for new subscriber
   */
  async initializeNewSubscriberBenefits() {
    try {
      // Unlock starter exclusive content
      await this.unlockExclusiveTheme('lightning_starter');
      await this.unlockExclusiveChallenge('lightning_welcome');
      await this.unlockPremiumAvatar('lightning_avatar');
      
      // Enable cloud save
      await this.enableCloudSave();
      
      console.log('LightningPassService: New subscriber benefits initialized');
    } catch (error) {
      console.error('LightningPassService: Failed to initialize new subscriber benefits:', error);
    }
  }

  /**
   * Disable benefits when subscription ends
   */
  async disableBenefits() {
    try {
      // Keep unlocked content but disable active features
      this.userBenefits.cloudSaveEnabled = false;
      await this.saveUserBenefits();
      
      console.log('LightningPassService: Benefits disabled');
    } catch (error) {
      console.error('LightningPassService: Failed to disable benefits:', error);
    }
  }

  /**
   * Add coins to user account
   */
  async addCoins(amount) {
    try {
      const currentCoins = await AsyncStorage.getItem('user_coins');
      const newCoins = (parseInt(currentCoins) || 0) + amount;
      await AsyncStorage.setItem('user_coins', newCoins.toString());
    } catch (error) {
      console.error('LightningPassService: Failed to add coins:', error);
    }
  }

  /**
   * Add hints to user account
   */
  async addHints(amount) {
    try {
      const currentHints = await AsyncStorage.getItem('user_hints');
      const newHints = (parseInt(currentHints) || 0) + amount;
      await AsyncStorage.setItem('user_hints', newHints.toString());
    } catch (error) {
      console.error('LightningPassService: Failed to add hints:', error);
    }
  }

  /**
   * Check subscription status
   */
  async checkSubscriptionStatus() {
    try {
      const subscriptionStatus = await this.iapService.checkSubscriptionStatus();
      
      if (!subscriptionStatus.lightningPass) {
        await this.disableBenefits();
      }
      
      return subscriptionStatus;
    } catch (error) {
      console.error('LightningPassService: Failed to check subscription status:', error);
      return { lightningPass: false, expiryDate: null, autoRenew: false };
    }
  }

  /**
   * Load user benefits
   */
  async loadUserBenefits() {
    try {
      const benefits = await AsyncStorage.getItem('lightning_pass_benefits');
      if (benefits) {
        this.userBenefits = { ...this.userBenefits, ...JSON.parse(benefits) };
      }
    } catch (error) {
      console.error('LightningPassService: Failed to load user benefits:', error);
    }
  }

  /**
   * Save user benefits
   */
  async saveUserBenefits() {
    try {
      await AsyncStorage.setItem('lightning_pass_benefits', JSON.stringify(this.userBenefits));
    } catch (error) {
      console.error('LightningPassService: Failed to save user benefits:', error);
    }
  }

  /**
   * Get Lightning Pass analytics
   */
  getLightningPassAnalytics() {
    return {
      features: this.lightningPassFeatures,
      userBenefits: this.userBenefits,
      subscriptionStatus: this.getSubscriptionStatus()
    };
  }
}

export default LightningPassService;
