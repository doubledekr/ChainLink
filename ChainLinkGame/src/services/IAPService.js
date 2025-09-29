import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * IAPService - In-App Purchase management system
 * Handles product purchases, subscriptions, and receipt validation
 */
class IAPService {
  constructor() {
    this.isInitialized = false;
    this.products = {
      coins: {
        small: { id: 'coins_small', price: 0.99, coins: 100, description: '100 Coins' },
        medium: { id: 'coins_medium', price: 2.99, coins: 350, description: '350 Coins (Best Value)' },
        large: { id: 'coins_large', price: 4.99, coins: 600, description: '600 Coins' },
        huge: { id: 'coins_huge', price: 9.99, coins: 1300, description: '1300 Coins' }
      },
      powerUps: {
        hints: { id: 'hints_pack', price: 0.99, hints: 10, description: '10 Hints Pack' },
        lives: { id: 'lives_pack', price: 1.99, lives: 5, description: '5 Lives Pack' },
        boosters: { id: 'boosters_pack', price: 2.99, boosters: 3, description: '3 Boosters Pack' }
      },
      themes: {
        premium: { id: 'premium_themes', price: 1.99, description: 'Premium Themes Pack' },
        seasonal: { id: 'seasonal_themes', price: 0.99, description: 'Seasonal Themes Pack' }
      },
      subscriptions: {
        lightningPass: { 
          id: 'lightning_pass_monthly', 
          price: 4.99, 
          duration: 'monthly',
          description: 'Lightning Pass Monthly',
          features: ['No Ads', 'Premium Themes', 'Exclusive Content', 'Priority Support']
        },
        lightningPassYearly: { 
          id: 'lightning_pass_yearly', 
          price: 39.99, 
          duration: 'yearly',
          description: 'Lightning Pass Yearly (Save 33%)',
          features: ['No Ads', 'Premium Themes', 'Exclusive Content', 'Priority Support']
        }
      }
    };
    this.purchaseHistory = [];
    this.subscriptionStatus = {
      lightningPass: false,
      expiryDate: null,
      autoRenew: false
    };
  }

  /**
   * Initialize the IAP service
   */
  async initialize() {
    try {
      // In a real implementation, this would initialize the IAP SDK
      // For now, we'll simulate the initialization
      console.log('IAPService: Initializing IAP SDK...');
      
      // Load purchase history and subscription status
      await this.loadPurchaseHistory();
      await this.loadSubscriptionStatus();
      
      this.isInitialized = true;
      console.log('IAPService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('IAPService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Get available products
   */
  getProducts(category = 'all') {
    if (category === 'all') {
      return this.products;
    }
    return this.products[category] || {};
  }

  /**
   * Purchase coins
   */
  async purchaseCoins(packId) {
    if (!this.isInitialized) {
      throw new Error('IAPService not initialized');
    }

    const product = this.products.coins[packId];
    if (!product) {
      throw new Error('Invalid coin pack ID');
    }

    try {
      // In a real implementation, this would initiate the actual purchase
      console.log(`IAPService: Purchasing ${product.description} for $${product.price}`);
      
      // Simulate purchase process
      const purchaseResult = await this.simulatePurchase(product);
      
      if (purchaseResult.success) {
        // Add coins to user account
        await this.addCoins(product.coins);
        
        // Record purchase
        await this.recordPurchase({
          productId: product.id,
          price: product.price,
          type: 'coins',
          amount: product.coins,
          timestamp: Date.now()
        });
        
        console.log(`IAPService: Successfully purchased ${product.coins} coins`);
        return { success: true, coins: product.coins };
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('IAPService: Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Purchase power-ups
   */
  async purchasePowerUps(packId) {
    if (!this.isInitialized) {
      throw new Error('IAPService not initialized');
    }

    const product = this.products.powerUps[packId];
    if (!product) {
      throw new Error('Invalid power-up pack ID');
    }

    try {
      console.log(`IAPService: Purchasing ${product.description} for $${product.price}`);
      
      const purchaseResult = await this.simulatePurchase(product);
      
      if (purchaseResult.success) {
        // Add power-ups to user account
        await this.addPowerUps(packId, product);
        
        // Record purchase
        await this.recordPurchase({
          productId: product.id,
          price: product.price,
          type: 'powerUps',
          amount: product.hints || product.lives || product.boosters,
          timestamp: Date.now()
        });
        
        console.log(`IAPService: Successfully purchased ${product.description}`);
        return { success: true, powerUps: product };
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('IAPService: Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Purchase themes
   */
  async purchaseThemes(packId) {
    if (!this.isInitialized) {
      throw new Error('IAPService not initialized');
    }

    const product = this.products.themes[packId];
    if (!product) {
      throw new Error('Invalid theme pack ID');
    }

    try {
      console.log(`IAPService: Purchasing ${product.description} for $${product.price}`);
      
      const purchaseResult = await this.simulatePurchase(product);
      
      if (purchaseResult.success) {
        // Unlock themes
        await this.unlockThemes(packId);
        
        // Record purchase
        await this.recordPurchase({
          productId: product.id,
          price: product.price,
          type: 'themes',
          timestamp: Date.now()
        });
        
        console.log(`IAPService: Successfully purchased ${product.description}`);
        return { success: true, themes: packId };
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('IAPService: Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to Lightning Pass
   */
  async subscribeToLightningPass(planId) {
    if (!this.isInitialized) {
      throw new Error('IAPService not initialized');
    }

    const subscription = this.products.subscriptions[planId];
    if (!subscription) {
      throw new Error('Invalid subscription plan ID');
    }

    try {
      console.log(`IAPService: Subscribing to ${subscription.description} for $${subscription.price}`);
      
      const subscriptionResult = await this.simulateSubscription(subscription);
      
      if (subscriptionResult.success) {
        // Activate subscription
        await this.activateSubscription(subscription);
        
        // Record purchase
        await this.recordPurchase({
          productId: subscription.id,
          price: subscription.price,
          type: 'subscription',
          duration: subscription.duration,
          timestamp: Date.now()
        });
        
        console.log(`IAPService: Successfully subscribed to ${subscription.description}`);
        return { success: true, subscription: subscription };
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('IAPService: Subscription failed:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription() {
    try {
      console.log('IAPService: Cancelling Lightning Pass subscription');
      
      // In a real implementation, this would cancel the actual subscription
      this.subscriptionStatus.lightningPass = false;
      this.subscriptionStatus.autoRenew = false;
      
      await this.saveSubscriptionStatus();
      
      console.log('IAPService: Subscription cancelled successfully');
      return { success: true };
    } catch (error) {
      console.error('IAPService: Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Check subscription status
   */
  async checkSubscriptionStatus() {
    try {
      // In a real implementation, this would check with the app store
      const now = Date.now();
      
      if (this.subscriptionStatus.expiryDate && now < this.subscriptionStatus.expiryDate) {
        this.subscriptionStatus.lightningPass = true;
      } else {
        this.subscriptionStatus.lightningPass = false;
      }
      
      await this.saveSubscriptionStatus();
      return this.subscriptionStatus;
    } catch (error) {
      console.error('IAPService: Failed to check subscription status:', error);
      return this.subscriptionStatus;
    }
  }

  /**
   * Get purchase history
   */
  getPurchaseHistory() {
    return [...this.purchaseHistory];
  }

  /**
   * Simulate purchase process
   */
  async simulatePurchase(product) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    
    return {
      success: success,
      transactionId: success ? `txn_${Date.now()}` : null,
      receipt: success ? `receipt_${Date.now()}` : null
    };
  }

  /**
   * Simulate subscription process
   */
  async simulateSubscription(subscription) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 95% success rate for subscriptions
    const success = Math.random() > 0.05;
    
    return {
      success: success,
      transactionId: success ? `sub_${Date.now()}` : null,
      receipt: success ? `sub_receipt_${Date.now()}` : null
    };
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
      console.error('IAPService: Failed to add coins:', error);
    }
  }

  /**
   * Add power-ups to user account
   */
  async addPowerUps(packId, product) {
    try {
      if (product.hints) {
        const currentHints = await AsyncStorage.getItem('user_hints');
        const newHints = (parseInt(currentHints) || 0) + product.hints;
        await AsyncStorage.setItem('user_hints', newHints.toString());
      }
      
      if (product.lives) {
        const currentLives = await AsyncStorage.getItem('user_lives');
        const newLives = (parseInt(currentLives) || 0) + product.lives;
        await AsyncStorage.setItem('user_lives', newLives.toString());
      }
      
      if (product.boosters) {
        const currentBoosters = await AsyncStorage.getItem('user_boosters');
        const newBoosters = (parseInt(currentBoosters) || 0) + product.boosters;
        await AsyncStorage.setItem('user_boosters', newBoosters.toString());
      }
    } catch (error) {
      console.error('IAPService: Failed to add power-ups:', error);
    }
  }

  /**
   * Unlock themes
   */
  async unlockThemes(packId) {
    try {
      const unlockedThemes = await AsyncStorage.getItem('unlocked_themes');
      const themes = unlockedThemes ? JSON.parse(unlockedThemes) : [];
      
      if (!themes.includes(packId)) {
        themes.push(packId);
        await AsyncStorage.setItem('unlocked_themes', JSON.stringify(themes));
      }
    } catch (error) {
      console.error('IAPService: Failed to unlock themes:', error);
    }
  }

  /**
   * Activate subscription
   */
  async activateSubscription(subscription) {
    try {
      const now = Date.now();
      let expiryDate;
      
      if (subscription.duration === 'monthly') {
        expiryDate = now + (30 * 24 * 60 * 60 * 1000); // 30 days
      } else if (subscription.duration === 'yearly') {
        expiryDate = now + (365 * 24 * 60 * 60 * 1000); // 365 days
      }
      
      this.subscriptionStatus.lightningPass = true;
      this.subscriptionStatus.expiryDate = expiryDate;
      this.subscriptionStatus.autoRenew = true;
      
      await this.saveSubscriptionStatus();
    } catch (error) {
      console.error('IAPService: Failed to activate subscription:', error);
    }
  }

  /**
   * Record purchase
   */
  async recordPurchase(purchase) {
    try {
      this.purchaseHistory.push(purchase);
      await this.savePurchaseHistory();
    } catch (error) {
      console.error('IAPService: Failed to record purchase:', error);
    }
  }

  /**
   * Load purchase history
   */
  async loadPurchaseHistory() {
    try {
      const history = await AsyncStorage.getItem('purchase_history');
      if (history) {
        this.purchaseHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('IAPService: Failed to load purchase history:', error);
    }
  }

  /**
   * Save purchase history
   */
  async savePurchaseHistory() {
    try {
      await AsyncStorage.setItem('purchase_history', JSON.stringify(this.purchaseHistory));
    } catch (error) {
      console.error('IAPService: Failed to save purchase history:', error);
    }
  }

  /**
   * Load subscription status
   */
  async loadSubscriptionStatus() {
    try {
      const status = await AsyncStorage.getItem('subscription_status');
      if (status) {
        this.subscriptionStatus = JSON.parse(status);
      }
    } catch (error) {
      console.error('IAPService: Failed to load subscription status:', error);
    }
  }

  /**
   * Save subscription status
   */
  async saveSubscriptionStatus() {
    try {
      await AsyncStorage.setItem('subscription_status', JSON.stringify(this.subscriptionStatus));
    } catch (error) {
      console.error('IAPService: Failed to save subscription status:', error);
    }
  }

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics() {
    const totalRevenue = this.purchaseHistory.reduce((sum, purchase) => sum + purchase.price, 0);
    const subscriptionRevenue = this.purchaseHistory
      .filter(p => p.type === 'subscription')
      .reduce((sum, purchase) => sum + purchase.price, 0);
    const oneTimeRevenue = this.purchaseHistory
      .filter(p => p.type !== 'subscription')
      .reduce((sum, purchase) => sum + purchase.price, 0);
    
    return {
      totalRevenue,
      subscriptionRevenue,
      oneTimeRevenue,
      purchaseCount: this.purchaseHistory.length,
      averagePurchaseValue: totalRevenue / Math.max(this.purchaseHistory.length, 1)
    };
  }
}

export default IAPService;
