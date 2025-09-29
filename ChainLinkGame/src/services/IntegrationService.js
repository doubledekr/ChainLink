import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import all services
import GameModeService from './GameModeService';
import AdService from './AdService';
import IAPService from './IAPService';
import LightningPassService from './LightningPassService';
import AchievementService from './AchievementService';
import RewardService from './RewardService';
import FeatureFlagService from './FeatureFlagService';
import AnalyticsService from './AnalyticsService';
import PerformanceService from './PerformanceService';

/**
 * IntegrationService - Central service coordinator
 * Handles service initialization, dependency management, and cross-service communication
 */
class IntegrationService {
  constructor() {
    this.isInitialized = false;
    this.services = {
      gameMode: new GameModeService(),
      ad: new AdService(),
      iap: new IAPService(),
      lightningPass: new LightningPassService(),
      achievement: new AchievementService(),
      reward: new RewardService(),
      featureFlag: new FeatureFlagService(),
      analytics: new AnalyticsService(),
      performance: new PerformanceService()
    };
    this.serviceDependencies = {
      gameMode: [],
      ad: ['featureFlag'],
      iap: ['featureFlag', 'analytics'],
      lightningPass: ['iap', 'featureFlag', 'analytics'],
      achievement: ['featureFlag', 'analytics'],
      reward: ['achievement', 'featureFlag', 'analytics'],
      featureFlag: [],
      analytics: ['featureFlag'],
      performance: []
    };
    this.initializationOrder = [
      'featureFlag',
      'analytics',
      'performance',
      'gameMode',
      'ad',
      'iap',
      'lightningPass',
      'achievement',
      'reward'
    ];
    this.serviceStatus = {};
    this.eventListeners = new Map();
  }

  /**
   * Initialize all services
   */
  async initialize() {
    try {
      console.log('IntegrationService: Starting service initialization...');
      
      // Initialize services in dependency order
      for (const serviceName of this.initializationOrder) {
        await this.initializeService(serviceName);
      }
      
      // Setup cross-service communication
      await this.setupServiceCommunication();
      
      // Start background processes
      await this.startBackgroundProcesses();
      
      this.isInitialized = true;
      console.log('IntegrationService: All services initialized successfully');
      
      // Track initialization completion
      this.services.analytics.trackEvent('app_initialization_complete', {
        platform: Platform.OS,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('IntegrationService: Initialization failed:', error);
      
      // Track initialization failure
      this.services.analytics.trackError('initialization_failure', error.message, {
        platform: Platform.OS,
        timestamp: Date.now()
      });
      
      return false;
    }
  }

  /**
   * Initialize a specific service
   */
  async initializeService(serviceName) {
    try {
      console.log(`IntegrationService: Initializing ${serviceName} service...`);
      
      const service = this.services[serviceName];
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }
      
      // Check if feature flag is enabled for this service
      if (this.shouldInitializeService(serviceName)) {
        const success = await service.initialize();
        
        if (success) {
          this.serviceStatus[serviceName] = 'initialized';
          console.log(`IntegrationService: ${serviceName} service initialized successfully`);
        } else {
          this.serviceStatus[serviceName] = 'failed';
          console.warn(`IntegrationService: ${serviceName} service initialization failed`);
        }
      } else {
        this.serviceStatus[serviceName] = 'disabled';
        console.log(`IntegrationService: ${serviceName} service disabled by feature flag`);
      }
    } catch (error) {
      this.serviceStatus[serviceName] = 'error';
      console.error(`IntegrationService: Error initializing ${serviceName} service:`, error);
      throw error;
    }
  }

  /**
   * Check if service should be initialized based on feature flags
   */
  shouldInitializeService(serviceName) {
    const featureFlags = {
      gameMode: 'game_modes',
      ad: 'monetization',
      iap: 'monetization',
      lightningPass: 'lightning_pass',
      achievement: 'achievements',
      reward: 'achievements',
      featureFlag: true, // Always initialize feature flags first
      analytics: 'analytics',
      performance: 'analytics'
    };
    
    const flagName = featureFlags[serviceName];
    if (flagName === true) return true;
    
    return this.services.featureFlag.isFeatureEnabled(flagName);
  }

  /**
   * Setup cross-service communication
   */
  async setupServiceCommunication() {
    try {
      console.log('IntegrationService: Setting up cross-service communication...');
      
      // Game Mode -> Achievement integration
      this.setupGameModeToAchievementIntegration();
      
      // Achievement -> Reward integration
      this.setupAchievementToRewardIntegration();
      
      // Monetization -> Analytics integration
      this.setupMonetizationToAnalyticsIntegration();
      
      // Performance -> Analytics integration
      this.setupPerformanceToAnalyticsIntegration();
      
      console.log('IntegrationService: Cross-service communication setup complete');
    } catch (error) {
      console.error('IntegrationService: Failed to setup service communication:', error);
    }
  }

  /**
   * Setup game mode to achievement integration
   */
  setupGameModeToAchievementIntegration() {
    // Listen for game mode events and trigger achievement checks
    this.addEventListener('game_mode_complete', async (eventData) => {
      try {
        const newAchievements = await this.services.achievement.checkForNewAchievements(eventData);
        
        if (newAchievements.length > 0) {
          // Emit achievement unlock events
          newAchievements.forEach(achievement => {
            this.emitEvent('achievement_unlocked', achievement);
          });
        }
      } catch (error) {
        console.error('IntegrationService: Failed to check achievements:', error);
      }
    });
  }

  /**
   * Setup achievement to reward integration
   */
  setupAchievementToRewardIntegration() {
    // Listen for achievement unlock events and distribute rewards
    this.addEventListener('achievement_unlocked', async (achievement) => {
      try {
        await this.services.reward.giveAchievementReward(achievement.rewards, achievement.id);
        
        // Track achievement unlock
        this.services.analytics.trackAchievementUnlock(
          achievement.id,
          achievement.name,
          achievement.rarity
        );
      } catch (error) {
        console.error('IntegrationService: Failed to distribute achievement rewards:', error);
      }
    });
  }

  /**
   * Setup monetization to analytics integration
   */
  setupMonetizationToAnalyticsIntegration() {
    // Listen for purchase events
    this.addEventListener('purchase_complete', (purchaseData) => {
      this.services.analytics.trackPurchaseComplete(
        purchaseData.productId,
        purchaseData.price,
        purchaseData.currency,
        purchaseData.success
      );
    });
    
    // Listen for ad events
    this.addEventListener('ad_view', (adData) => {
      this.services.analytics.trackAdView(
        adData.adType,
        adData.placement,
        adData.success
      );
    });
  }

  /**
   * Setup performance to analytics integration
   */
  setupPerformanceToAnalyticsIntegration() {
    // Listen for performance events
    this.addEventListener('performance_metric', (metricData) => {
      this.services.analytics.trackPerformanceMetric(
        metricData.metricName,
        metricData.value,
        metricData.unit
      );
    });
    
    // Listen for error events
    this.addEventListener('error_occurred', (errorData) => {
      this.services.analytics.trackError(
        errorData.errorType,
        errorData.errorMessage,
        errorData.context
      );
    });
  }

  /**
   * Start background processes
   */
  async startBackgroundProcesses() {
    try {
      console.log('IntegrationService: Starting background processes...');
      
      // Start daily reward checking
      this.startDailyRewardChecking();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Start analytics flushing
      this.startAnalyticsFlushing();
      
      console.log('IntegrationService: Background processes started');
    } catch (error) {
      console.error('IntegrationService: Failed to start background processes:', error);
    }
  }

  /**
   * Start daily reward checking
   */
  startDailyRewardChecking() {
    // Check for daily rewards every hour
    setInterval(async () => {
      try {
        const dailyRewardStatus = this.services.reward.getDailyRewardStatus();
        
        if (dailyRewardStatus.canClaim) {
          this.emitEvent('daily_reward_available', dailyRewardStatus);
        }
      } catch (error) {
        console.error('IntegrationService: Failed to check daily rewards:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    // Monitor performance every 30 seconds
    setInterval(() => {
      try {
        const performanceReport = this.services.performance.getPerformanceReport();
        
        // Check for performance issues
        if (performanceReport.recommendations.length > 0) {
          this.emitEvent('performance_issues_detected', performanceReport);
        }
      } catch (error) {
        console.error('IntegrationService: Failed to monitor performance:', error);
      }
    }, 30 * 1000); // 30 seconds
  }

  /**
   * Start analytics flushing
   */
  startAnalyticsFlushing() {
    // Flush analytics every 5 minutes
    setInterval(async () => {
      try {
        await this.services.analytics.flushEvents();
      } catch (error) {
        console.error('IntegrationService: Failed to flush analytics:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get service by name
   */
  getService(serviceName) {
    return this.services[serviceName];
  }

  /**
   * Get service status
   */
  getServiceStatus(serviceName) {
    return this.serviceStatus[serviceName];
  }

  /**
   * Get all service statuses
   */
  getAllServiceStatuses() {
    return { ...this.serviceStatus };
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(serviceName) {
    return this.serviceStatus[serviceName] === 'initialized';
  }

  /**
   * Add event listener
   */
  addEventListener(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    
    this.eventListeners.get(eventName).push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventName, callback) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      const index = listeners.indexOf(callback);
      
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  emitEvent(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`IntegrationService: Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Get integration health report
   */
  getIntegrationHealthReport() {
    const healthReport = {
      overallHealth: 'healthy',
      services: {},
      recommendations: []
    };
    
    let healthyServices = 0;
    let totalServices = 0;
    
    Object.keys(this.serviceStatus).forEach(serviceName => {
      const status = this.serviceStatus[serviceName];
      totalServices++;
      
      healthReport.services[serviceName] = {
        status: status,
        available: status === 'initialized'
      };
      
      if (status === 'initialized') {
        healthyServices++;
      } else if (status === 'failed' || status === 'error') {
        healthReport.recommendations.push({
          service: serviceName,
          issue: `Service ${serviceName} is not functioning properly`,
          priority: 'high'
        });
      }
    });
    
    // Calculate overall health
    const healthPercentage = (healthyServices / totalServices) * 100;
    
    if (healthPercentage >= 90) {
      healthReport.overallHealth = 'healthy';
    } else if (healthPercentage >= 70) {
      healthReport.overallHealth = 'warning';
    } else {
      healthReport.overallHealth = 'critical';
    }
    
    return healthReport;
  }

  /**
   * Restart a service
   */
  async restartService(serviceName) {
    try {
      console.log(`IntegrationService: Restarting ${serviceName} service...`);
      
      // Reinitialize the service
      await this.initializeService(serviceName);
      
      console.log(`IntegrationService: ${serviceName} service restarted successfully`);
      return true;
    } catch (error) {
      console.error(`IntegrationService: Failed to restart ${serviceName} service:`, error);
      return false;
    }
  }

  /**
   * Shutdown all services
   */
  async shutdown() {
    try {
      console.log('IntegrationService: Shutting down all services...');
      
      // End analytics session
      if (this.isServiceAvailable('analytics')) {
        this.services.analytics.endSession();
      }
      
      // Clear event listeners
      this.eventListeners.clear();
      
      // Reset service status
      this.serviceStatus = {};
      this.isInitialized = false;
      
      console.log('IntegrationService: All services shut down successfully');
    } catch (error) {
      console.error('IntegrationService: Error during shutdown:', error);
    }
  }
}

export default IntegrationService;
