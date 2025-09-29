import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * AnalyticsService - Analytics and telemetry collection
 * Handles event tracking, user behavior analysis, and performance monitoring
 */
class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.events = [];
    this.userProperties = {};
    this.sessionData = {
      sessionId: null,
      startTime: null,
      events: [],
      performance: {}
    };
    this.analyticsConfig = {
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      debugMode: __DEV__
    };
    this.eventTypes = {
      game_start: 'game_start',
      game_end: 'game_end',
      puzzle_complete: 'puzzle_complete',
      puzzle_fail: 'puzzle_fail',
      achievement_unlock: 'achievement_unlock',
      reward_claim: 'reward_claim',
      purchase_complete: 'purchase_complete',
      ad_view: 'ad_view',
      feature_use: 'feature_use',
      error_occurred: 'error_occurred',
      performance_metric: 'performance_metric'
    };
  }

  /**
   * Initialize the analytics service
   */
  async initialize() {
    try {
      console.log('AnalyticsService: Initializing...');
      
      // Load cached events and user properties
      await this.loadCachedData();
      
      // Start new session
      this.startSession();
      
      // Start periodic flush
      this.startPeriodicFlush();
      
      this.isInitialized = true;
      console.log('AnalyticsService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('AnalyticsService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Track an event
   */
  trackEvent(eventType, properties = {}) {
    if (!this.isInitialized) {
      console.warn('AnalyticsService: Not initialized, event not tracked');
      return;
    }

    try {
      const event = {
        eventType: eventType,
        properties: {
          ...properties,
          timestamp: Date.now(),
          sessionId: this.sessionData.sessionId,
          platform: Platform.OS,
          appVersion: '1.0.0'
        }
      };

      this.events.push(event);
      this.sessionData.events.push(event);

      // Auto-flush if batch size reached
      if (this.events.length >= this.analyticsConfig.batchSize) {
        this.flushEvents();
      }

      if (this.analyticsConfig.debugMode) {
        console.log('AnalyticsService: Event tracked:', event);
      }
    } catch (error) {
      console.error('AnalyticsService: Failed to track event:', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties) {
    try {
      this.userProperties = { ...this.userProperties, ...properties };
      this.saveUserProperties();
      
      if (this.analyticsConfig.debugMode) {
        console.log('AnalyticsService: User properties updated:', this.userProperties);
      }
    } catch (error) {
      console.error('AnalyticsService: Failed to set user properties:', error);
    }
  }

  /**
   * Track game start
   */
  trackGameStart(gameMode, difficulty = 'normal') {
    this.trackEvent(this.eventTypes.game_start, {
      gameMode: gameMode,
      difficulty: difficulty,
      timestamp: Date.now()
    });
  }

  /**
   * Track game end
   */
  trackGameEnd(gameMode, score, timePlayed, puzzlesCompleted) {
    this.trackEvent(this.eventTypes.game_end, {
      gameMode: gameMode,
      score: score,
      timePlayed: timePlayed,
      puzzlesCompleted: puzzlesCompleted,
      timestamp: Date.now()
    });
  }

  /**
   * Track puzzle completion
   */
  trackPuzzleComplete(puzzleData) {
    this.trackEvent(this.eventTypes.puzzle_complete, {
      puzzleId: puzzleData.id,
      word: puzzleData.word,
      timeToComplete: puzzleData.timeToComplete,
      hintsUsed: puzzleData.hintsUsed,
      difficulty: puzzleData.difficulty,
      score: puzzleData.score
    });
  }

  /**
   * Track puzzle failure
   */
  trackPuzzleFail(puzzleData) {
    this.trackEvent(this.eventTypes.puzzle_fail, {
      puzzleId: puzzleData.id,
      word: puzzleData.word,
      timeSpent: puzzleData.timeSpent,
      hintsUsed: puzzleData.hintsUsed,
      difficulty: puzzleData.difficulty
    });
  }

  /**
   * Track achievement unlock
   */
  trackAchievementUnlock(achievementId, achievementName, rarity) {
    this.trackEvent(this.eventTypes.achievement_unlock, {
      achievementId: achievementId,
      achievementName: achievementName,
      rarity: rarity,
      timestamp: Date.now()
    });
  }

  /**
   * Track reward claim
   */
  trackRewardClaim(rewardType, rewardAmount, source) {
    this.trackEvent(this.eventTypes.reward_claim, {
      rewardType: rewardType,
      rewardAmount: rewardAmount,
      source: source,
      timestamp: Date.now()
    });
  }

  /**
   * Track purchase completion
   */
  trackPurchaseComplete(productId, price, currency, success) {
    this.trackEvent(this.eventTypes.purchase_complete, {
      productId: productId,
      price: price,
      currency: currency,
      success: success,
      timestamp: Date.now()
    });
  }

  /**
   * Track ad view
   */
  trackAdView(adType, placement, success) {
    this.trackEvent(this.eventTypes.ad_view, {
      adType: adType,
      placement: placement,
      success: success,
      timestamp: Date.now()
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUse(featureName, action, properties = {}) {
    this.trackEvent(this.eventTypes.feature_use, {
      featureName: featureName,
      action: action,
      ...properties,
      timestamp: Date.now()
    });
  }

  /**
   * Track error occurrence
   */
  trackError(errorType, errorMessage, context = {}) {
    this.trackEvent(this.eventTypes.error_occurred, {
      errorType: errorType,
      errorMessage: errorMessage,
      context: context,
      timestamp: Date.now()
    });
  }

  /**
   * Track performance metric
   */
  trackPerformanceMetric(metricName, value, unit = 'ms') {
    this.trackEvent(this.eventTypes.performance_metric, {
      metricName: metricName,
      value: value,
      unit: unit,
      timestamp: Date.now()
    });
  }

  /**
   * Start a new session
   */
  startSession() {
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      events: [],
      performance: {}
    };

    this.trackEvent('session_start', {
      sessionId: this.sessionData.sessionId,
      timestamp: this.sessionData.startTime
    });
  }

  /**
   * End current session
   */
  endSession() {
    if (this.sessionData.sessionId) {
      const sessionDuration = Date.now() - this.sessionData.startTime;
      
      this.trackEvent('session_end', {
        sessionId: this.sessionData.sessionId,
        duration: sessionDuration,
        eventCount: this.sessionData.events.length,
        timestamp: Date.now()
      });

      // Flush remaining events
      this.flushEvents();
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Flush events to server
   */
  async flushEvents() {
    if (this.events.length === 0) return;

    try {
      const eventsToSend = [...this.events];
      this.events = [];

      // In a real implementation, this would send to analytics server
      await this.sendEventsToServer(eventsToSend);
      
      if (this.analyticsConfig.debugMode) {
        console.log(`AnalyticsService: Flushed ${eventsToSend.length} events`);
      }
    } catch (error) {
      console.error('AnalyticsService: Failed to flush events:', error);
      
      // Re-add events to queue for retry
      this.events.unshift(...eventsToSend);
      
      // Limit retry queue size
      if (this.events.length > this.analyticsConfig.batchSize * 2) {
        this.events = this.events.slice(0, this.analyticsConfig.batchSize * 2);
      }
    }
  }

  /**
   * Send events to server
   */
  async sendEventsToServer(events) {
    // In a real implementation, this would send to Firebase Analytics, Mixpanel, etc.
    console.log('AnalyticsService: Sending events to server:', events.length);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate 95% success rate
    if (Math.random() > 0.05) {
      console.log('AnalyticsService: Events sent successfully');
    } else {
      throw new Error('Network error');
    }
  }

  /**
   * Start periodic flush
   */
  startPeriodicFlush() {
    setInterval(() => {
      this.flushEvents();
    }, this.analyticsConfig.flushInterval);
  }

  /**
   * Get analytics data
   */
  getAnalyticsData() {
    return {
      events: this.events,
      userProperties: this.userProperties,
      sessionData: this.sessionData,
      config: this.analyticsConfig
    };
  }

  /**
   * Get event statistics
   */
  getEventStatistics() {
    const eventCounts = {};
    const eventTypes = new Set();

    this.events.forEach(event => {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
      eventTypes.add(event.eventType);
    });

    return {
      totalEvents: this.events.length,
      eventTypes: Array.from(eventTypes),
      eventCounts: eventCounts,
      sessionDuration: this.sessionData.startTime ? Date.now() - this.sessionData.startTime : 0
    };
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics() {
    const gameStartEvents = this.events.filter(e => e.eventType === 'game_start');
    const gameEndEvents = this.events.filter(e => e.eventType === 'game_end');
    const achievementEvents = this.events.filter(e => e.eventType === 'achievement_unlock');
    const rewardEvents = this.events.filter(e => e.eventType === 'reward_claim');

    return {
      gamesPlayed: gameStartEvents.length,
      gamesCompleted: gameEndEvents.length,
      achievementsUnlocked: achievementEvents.length,
      rewardsClaimed: rewardEvents.length,
      averageSessionLength: this.getAverageSessionLength(),
      mostPlayedGameMode: this.getMostPlayedGameMode()
    };
  }

  /**
   * Get average session length
   */
  getAverageSessionLength() {
    const sessionEndEvents = this.events.filter(e => e.eventType === 'session_end');
    if (sessionEndEvents.length === 0) return 0;

    const totalDuration = sessionEndEvents.reduce((sum, event) => 
      sum + (event.properties.duration || 0), 0);
    
    return Math.round(totalDuration / sessionEndEvents.length);
  }

  /**
   * Get most played game mode
   */
  getMostPlayedGameMode() {
    const gameStartEvents = this.events.filter(e => e.eventType === 'game_start');
    const modeCounts = {};

    gameStartEvents.forEach(event => {
      const mode = event.properties.gameMode;
      modeCounts[mode] = (modeCounts[mode] || 0) + 1;
    });

    return Object.keys(modeCounts).reduce((a, b) => 
      modeCounts[a] > modeCounts[b] ? a : b, 'unknown');
  }

  /**
   * Load cached data
   */
  async loadCachedData() {
    try {
      const [events, userProperties] = await Promise.all([
        AsyncStorage.getItem('analytics_events'),
        AsyncStorage.getItem('analytics_user_properties')
      ]);

      if (events) {
        this.events = JSON.parse(events);
      }

      if (userProperties) {
        this.userProperties = JSON.parse(userProperties);
      }
    } catch (error) {
      console.error('AnalyticsService: Failed to load cached data:', error);
    }
  }

  /**
   * Save user properties
   */
  async saveUserProperties() {
    try {
      await AsyncStorage.setItem('analytics_user_properties', JSON.stringify(this.userProperties));
    } catch (error) {
      console.error('AnalyticsService: Failed to save user properties:', error);
    }
  }

  /**
   * Clear analytics data
   */
  async clearAnalyticsData() {
    try {
      this.events = [];
      this.userProperties = {};
      await AsyncStorage.multiRemove(['analytics_events', 'analytics_user_properties']);
      console.log('AnalyticsService: Analytics data cleared');
    } catch (error) {
      console.error('AnalyticsService: Failed to clear analytics data:', error);
    }
  }

  /**
   * Enable debug mode
   */
  enableDebugMode() {
    this.analyticsConfig.debugMode = true;
    console.log('AnalyticsService: Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disableDebugMode() {
    this.analyticsConfig.debugMode = false;
    console.log('AnalyticsService: Debug mode disabled');
  }
}

export default AnalyticsService;
