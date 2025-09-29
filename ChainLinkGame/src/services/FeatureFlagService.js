import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * FeatureFlagService - Feature flag management and A/B testing
 * Handles feature toggles, remote configuration, and gradual rollouts
 */
class FeatureFlagService {
  constructor() {
    this.isInitialized = false;
    this.featureFlags = new Map();
    this.remoteConfig = {};
    this.userSegments = {
      newUser: false,
      premiumUser: false,
      betaTester: false,
      region: 'US',
      deviceType: Platform.OS,
      appVersion: '1.0.0'
    };
    this.initializeDefaultFlags();
  }

  /**
   * Initialize the feature flag service
   */
  async initialize() {
    try {
      console.log('FeatureFlagService: Initializing...');
      
      // Load user segments
      await this.loadUserSegments();
      
      // Load cached feature flags
      await this.loadFeatureFlags();
      
      // Fetch remote configuration
      await this.fetchRemoteConfig();
      
      this.isInitialized = true;
      console.log('FeatureFlagService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('FeatureFlagService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize default feature flags
   */
  initializeDefaultFlags() {
    // Core Features
    this.addFeatureFlag('leaderboards', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Global leaderboards and rankings'
    });

    this.addFeatureFlag('daily_challenges', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Daily challenge system'
    });

    this.addFeatureFlag('seasonal_content', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Seasonal challenges and themes'
    });

    this.addFeatureFlag('game_modes', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Multiple game modes (Blitz, Zen, Survival, etc.)'
    });

    this.addFeatureFlag('monetization', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'In-app purchases and ads'
    });

    this.addFeatureFlag('achievements', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Achievement and reward system'
    });

    // Premium Features
    this.addFeatureFlag('lightning_pass', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Lightning Pass subscription'
    });

    this.addFeatureFlag('cloud_save', {
      enabled: true,
      rolloutPercentage: 50,
      minVersion: '1.0.0',
      segments: ['premium'],
      description: 'Cloud save functionality'
    });

    // Beta Features
    this.addFeatureFlag('social_features', {
      enabled: false,
      rolloutPercentage: 25,
      minVersion: '1.0.0',
      segments: ['beta'],
      description: 'Social features and friend system'
    });

    this.addFeatureFlag('multiplayer', {
      enabled: false,
      rolloutPercentage: 10,
      minVersion: '1.0.0',
      segments: ['beta'],
      description: 'Real-time multiplayer gameplay'
    });

    this.addFeatureFlag('voice_chat', {
      enabled: false,
      rolloutPercentage: 5,
      minVersion: '1.0.0',
      segments: ['beta'],
      description: 'Voice chat functionality'
    });

    // Experimental Features
    this.addFeatureFlag('ai_difficulty', {
      enabled: false,
      rolloutPercentage: 20,
      minVersion: '1.0.0',
      segments: ['beta'],
      description: 'AI-powered difficulty adjustment'
    });

    this.addFeatureFlag('custom_themes', {
      enabled: false,
      rolloutPercentage: 30,
      minVersion: '1.0.0',
      segments: ['premium'],
      description: 'User-created custom themes'
    });

    // Regional Features
    this.addFeatureFlag('localization', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Multi-language support'
    });

    this.addFeatureFlag('regional_events', {
      enabled: false,
      rolloutPercentage: 50,
      minVersion: '1.0.0',
      segments: ['region_specific'],
      description: 'Region-specific events and content'
    });

    // Performance Features
    this.addFeatureFlag('offline_mode', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Offline gameplay support'
    });

    this.addFeatureFlag('analytics', {
      enabled: true,
      rolloutPercentage: 100,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'Analytics and telemetry'
    });

    // A/B Testing Flags
    this.addFeatureFlag('ui_variant_a', {
      enabled: true,
      rolloutPercentage: 50,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'UI variant A for A/B testing'
    });

    this.addFeatureFlag('ui_variant_b', {
      enabled: false,
      rolloutPercentage: 50,
      minVersion: '1.0.0',
      segments: ['all'],
      description: 'UI variant B for A/B testing'
    });

    this.addFeatureFlag('onboarding_flow_v2', {
      enabled: false,
      rolloutPercentage: 30,
      minVersion: '1.0.0',
      segments: ['new'],
      description: 'New user onboarding flow'
    });
  }

  /**
   * Add a feature flag
   */
  addFeatureFlag(key, config) {
    this.featureFlags.set(key, {
      key: key,
      enabled: config.enabled || false,
      rolloutPercentage: config.rolloutPercentage || 0,
      minVersion: config.minVersion || '1.0.0',
      segments: config.segments || [],
      description: config.description || '',
      lastUpdated: Date.now()
    });
  }

  /**
   * Check if a feature is enabled for the current user
   */
  isFeatureEnabled(featureKey) {
    if (!this.isInitialized) {
      console.warn('FeatureFlagService: Not initialized, using default values');
      return false;
    }

    const feature = this.featureFlags.get(featureKey);
    if (!feature) {
      console.warn(`FeatureFlagService: Unknown feature flag: ${featureKey}`);
      return false;
    }

    // Check if feature is globally disabled
    if (!feature.enabled) {
      return false;
    }

    // Check version requirement
    if (!this.checkVersionRequirement(feature.minVersion)) {
      return false;
    }

    // Check user segments
    if (!this.checkUserSegments(feature.segments)) {
      return false;
    }

    // Check rollout percentage
    if (!this.checkRolloutPercentage(featureKey, feature.rolloutPercentage)) {
      return false;
    }

    return true;
  }

  /**
   * Check version requirement
   */
  checkVersionRequirement(minVersion) {
    const currentVersion = this.userSegments.appVersion;
    return this.compareVersions(currentVersion, minVersion) >= 0;
  }

  /**
   * Compare version strings
   */
  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    
    return 0;
  }

  /**
   * Check user segments
   */
  checkUserSegments(requiredSegments) {
    if (requiredSegments.includes('all')) {
      return true;
    }

    return requiredSegments.some(segment => {
      switch (segment) {
        case 'new':
          return this.userSegments.newUser;
        case 'premium':
          return this.userSegments.premiumUser;
        case 'beta':
          return this.userSegments.betaTester;
        case 'region_specific':
          return true; // All users have a region
        default:
          return false;
      }
    });
  }

  /**
   * Check rollout percentage
   */
  checkRolloutPercentage(featureKey, percentage) {
    // Generate consistent hash for user + feature
    const userId = this.getUserId();
    const hash = this.simpleHash(`${userId}_${featureKey}`);
    
    // Convert hash to percentage (0-99)
    const userPercentage = Math.abs(hash) % 100;
    
    return userPercentage < percentage;
  }

  /**
   * Simple hash function for consistent user assignment
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Get user ID for consistent feature assignment
   */
  getUserId() {
    // In a real app, this would be the actual user ID
    // For now, use a combination of device info
    return `${this.userSegments.deviceType}_${this.userSegments.region}`;
  }

  /**
   * Get feature flag configuration
   */
  getFeatureFlag(featureKey) {
    return this.featureFlags.get(featureKey);
  }

  /**
   * Get all feature flags
   */
  getAllFeatureFlags() {
    return Array.from(this.featureFlags.values());
  }

  /**
   * Get enabled features for current user
   */
  getEnabledFeatures() {
    return this.getAllFeatureFlags().filter(feature => 
      this.isFeatureEnabled(feature.key)
    );
  }

  /**
   * Update feature flag
   */
  updateFeatureFlag(featureKey, updates) {
    const feature = this.featureFlags.get(featureKey);
    if (feature) {
      Object.assign(feature, updates, { lastUpdated: Date.now() });
      this.featureFlags.set(featureKey, feature);
      this.saveFeatureFlags();
    }
  }

  /**
   * Fetch remote configuration
   */
  async fetchRemoteConfig() {
    try {
      // In a real implementation, this would fetch from a remote server
      // For now, we'll simulate remote config updates
      console.log('FeatureFlagService: Fetching remote configuration...');
      
      // Simulate remote config updates
      const remoteUpdates = {
        'social_features': { enabled: true, rolloutPercentage: 30 },
        'multiplayer': { enabled: true, rolloutPercentage: 15 },
        'ai_difficulty': { enabled: true, rolloutPercentage: 25 }
      };

      // Apply remote updates
      for (const [key, updates] of Object.entries(remoteUpdates)) {
        this.updateFeatureFlag(key, updates);
      }

      this.remoteConfig = {
        lastFetched: Date.now(),
        version: '1.0.0'
      };

      console.log('FeatureFlagService: Remote configuration updated');
    } catch (error) {
      console.error('FeatureFlagService: Failed to fetch remote config:', error);
    }
  }

  /**
   * Load user segments
   */
  async loadUserSegments() {
    try {
      const segments = await AsyncStorage.getItem('user_segments');
      if (segments) {
        this.userSegments = { ...this.userSegments, ...JSON.parse(segments) };
      }
    } catch (error) {
      console.error('FeatureFlagService: Failed to load user segments:', error);
    }
  }

  /**
   * Save user segments
   */
  async saveUserSegments() {
    try {
      await AsyncStorage.setItem('user_segments', JSON.stringify(this.userSegments));
    } catch (error) {
      console.error('FeatureFlagService: Failed to save user segments:', error);
    }
  }

  /**
   * Load feature flags from storage
   */
  async loadFeatureFlags() {
    try {
      const flags = await AsyncStorage.getItem('feature_flags');
      if (flags) {
        const flagArray = JSON.parse(flags);
        this.featureFlags.clear();
        
        flagArray.forEach(flag => {
          this.featureFlags.set(flag.key, flag);
        });
      }
    } catch (error) {
      console.error('FeatureFlagService: Failed to load feature flags:', error);
    }
  }

  /**
   * Save feature flags to storage
   */
  async saveFeatureFlags() {
    try {
      const flags = Array.from(this.featureFlags.values());
      await AsyncStorage.setItem('feature_flags', JSON.stringify(flags));
    } catch (error) {
      console.error('FeatureFlagService: Failed to save feature flags:', error);
    }
  }

  /**
   * Update user segments
   */
  async updateUserSegments(updates) {
    this.userSegments = { ...this.userSegments, ...updates };
    await this.saveUserSegments();
  }

  /**
   * Get feature flag analytics
   */
  getFeatureFlagAnalytics() {
    const allFlags = this.getAllFeatureFlags();
    const enabledFlags = this.getEnabledFeatures();
    
    return {
      totalFlags: allFlags.length,
      enabledFlags: enabledFlags.length,
      enabledPercentage: Math.round((enabledFlags.length / allFlags.length) * 100),
      flagsByCategory: this.getFlagsByCategory(),
      rolloutStatus: this.getRolloutStatus()
    };
  }

  /**
   * Get flags by category
   */
  getFlagsByCategory() {
    const categories = {
      core: [],
      premium: [],
      beta: [],
      experimental: [],
      regional: [],
      performance: [],
      ab_testing: []
    };

    this.getAllFeatureFlags().forEach(flag => {
      if (flag.key.includes('ui_variant') || flag.key.includes('onboarding')) {
        categories.ab_testing.push(flag);
      } else if (flag.key.includes('social') || flag.key.includes('multiplayer')) {
        categories.beta.push(flag);
      } else if (flag.key.includes('lightning_pass') || flag.key.includes('cloud')) {
        categories.premium.push(flag);
      } else if (flag.key.includes('ai_') || flag.key.includes('custom_')) {
        categories.experimental.push(flag);
      } else if (flag.key.includes('regional') || flag.key.includes('localization')) {
        categories.regional.push(flag);
      } else if (flag.key.includes('offline') || flag.key.includes('analytics')) {
        categories.performance.push(flag);
      } else {
        categories.core.push(flag);
      }
    });

    return categories;
  }

  /**
   * Get rollout status
   */
  getRolloutStatus() {
    const allFlags = this.getAllFeatureFlags();
    const status = {
      fully_rolled_out: 0,
      partial_rollout: 0,
      disabled: 0
    };

    allFlags.forEach(flag => {
      if (!flag.enabled) {
        status.disabled++;
      } else if (flag.rolloutPercentage >= 100) {
        status.fully_rolled_out++;
      } else {
        status.partial_rollout++;
      }
    });

    return status;
  }
}

export default FeatureFlagService;
