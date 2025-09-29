import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IntegrationService from '../../services/IntegrationService';
import FeatureFlagService from '../../services/FeatureFlagService';
import AnalyticsService from '../../services/AnalyticsService';
import PerformanceService from '../../services/PerformanceService';

const { width, height } = Dimensions.get('window');

/**
 * AppInitializer - Application initialization and loading screen
 * Handles service initialization, feature flag loading, and user onboarding
 */
const AppInitializer = ({ 
  onInitializationComplete,
  onInitializationError,
  style 
}) => {
  const [initializationState, setInitializationState] = useState({
    phase: 'starting',
    progress: 0,
    currentService: '',
    error: null,
    services: {}
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  
  const integrationService = useRef(null);
  const initializationSteps = useRef([
    { name: 'Core Services', services: ['featureFlag', 'analytics', 'performance'] },
    { name: 'Game Services', services: ['gameMode'] },
    { name: 'Monetization', services: ['ad', 'iap', 'lightningPass'] },
    { name: 'Engagement', services: ['achievement', 'reward'] }
  ]);
  const currentStepIndex = useRef(0);

  useEffect(() => {
    startInitialization();
  }, []);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    // Update progress animation
    Animated.timing(progressAnim, {
      toValue: initializationState.progress / 100,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [initializationState.progress]);

  /**
   * Start application initialization
   */
  const startInitialization = async () => {
    try {
      setInitializationState(prev => ({
        ...prev,
        phase: 'initializing',
        progress: 0,
        currentService: 'Initializing services...'
      }));

      // Create integration service
      integrationService.current = new IntegrationService();
      
      // Initialize services step by step
      await initializeServicesStepByStep();
      
      // Complete initialization
      await completeInitialization();
      
    } catch (error) {
      handleInitializationError(error);
    }
  };

  /**
   * Initialize services step by step
   */
  const initializeServicesStepByStep = async () => {
    for (let stepIndex = 0; stepIndex < initializationSteps.current.length; stepIndex++) {
      const step = initializationSteps.current[stepIndex];
      currentStepIndex.current = stepIndex;
      
      setInitializationState(prev => ({
        ...prev,
        currentService: step.name,
        progress: (stepIndex / initializationSteps.current.length) * 80
      }));

      // Initialize services in this step
      for (const serviceName of step.services) {
        await initializeService(serviceName);
      }
      
      // Add delay for smooth progress animation
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  /**
   * Initialize a specific service
   */
  const initializeService = async (serviceName) => {
    try {
      setInitializationState(prev => ({
        ...prev,
        currentService: `Loading ${getServiceDisplayName(serviceName)}...`,
        services: {
          ...prev.services,
          [serviceName]: 'loading'
        }
      }));

      // Initialize the service
      const service = integrationService.current.getService(serviceName);
      const success = await service.initialize();
      
      setInitializationState(prev => ({
        ...prev,
        services: {
          ...prev.services,
          [serviceName]: success ? 'loaded' : 'failed'
        }
      }));

      if (!success) {
        console.warn(`Failed to initialize ${serviceName} service`);
      }
      
    } catch (error) {
      console.error(`Error initializing ${serviceName} service:`, error);
      
      setInitializationState(prev => ({
        ...prev,
        services: {
          ...prev.services,
          [serviceName]: 'error'
        }
      }));
    }
  };

  /**
   * Complete initialization
   */
  const completeInitialization = async () => {
    try {
      setInitializationState(prev => ({
        ...prev,
        phase: 'finalizing',
        currentService: 'Finalizing setup...',
        progress: 90
      }));

      // Final setup tasks
      await performFinalSetup();
      
      setInitializationState(prev => ({
        ...prev,
        phase: 'complete',
        currentService: 'Ready!',
        progress: 100
      }));

      // Track initialization completion
      const analytics = integrationService.current.getService('analytics');
      if (analytics) {
        analytics.trackEvent('app_initialization_complete', {
          initializationTime: Date.now(),
          servicesLoaded: Object.keys(initializationState.services).length
        });
      }

      // Delay before calling completion callback
      setTimeout(() => {
        if (onInitializationComplete) {
          onInitializationComplete(integrationService.current);
        }
      }, 1000);

    } catch (error) {
      handleInitializationError(error);
    }
  };

  /**
   * Perform final setup tasks
   */
  const performFinalSetup = async () => {
    // Check feature flags
    const featureFlagService = integrationService.current.getService('featureFlag');
    if (featureFlagService) {
      const enabledFeatures = featureFlagService.getEnabledFeatures();
      console.log('Enabled features:', enabledFeatures.map(f => f.key));
    }

    // Setup analytics
    const analyticsService = integrationService.current.getService('analytics');
    if (analyticsService) {
      analyticsService.setUserProperties({
        platform: 'react-native',
        appVersion: '1.0.0',
        initializationTime: Date.now()
      });
    }

    // Check performance
    const performanceService = integrationService.current.getService('performance');
    if (performanceService) {
      const performanceReport = performanceService.getPerformanceReport();
      if (performanceReport.recommendations.length > 0) {
        console.warn('Performance recommendations:', performanceReport.recommendations);
      }
    }
  };

  /**
   * Handle initialization error
   */
  const handleInitializationError = (error) => {
    console.error('App initialization failed:', error);
    
    setInitializationState(prev => ({
      ...prev,
      phase: 'error',
      error: error.message || 'Initialization failed',
      currentService: 'Error occurred'
    }));

    // Track initialization error
    const analytics = integrationService.current?.getService('analytics');
    if (analytics) {
      analytics.trackError('app_initialization_failure', error.message, {
        phase: initializationState.phase,
        progress: initializationState.progress
      });
    }

    if (onInitializationError) {
      onInitializationError(error);
    }
  };

  /**
   * Get service display name
   */
  const getServiceDisplayName = (serviceName) => {
    const displayNames = {
      featureFlag: 'Feature Flags',
      analytics: 'Analytics',
      performance: 'Performance Monitor',
      gameMode: 'Game Modes',
      ad: 'Advertising',
      iap: 'In-App Purchases',
      lightningPass: 'Lightning Pass',
      achievement: 'Achievements',
      reward: 'Rewards'
    };
    
    return displayNames[serviceName] || serviceName;
  };

  /**
   * Get service status icon
   */
  const getServiceStatusIcon = (status) => {
    switch (status) {
      case 'loaded': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'error': return 'alert-circle';
      case 'loading': return 'hourglass';
      default: return 'ellipse-outline';
    }
  };

  /**
   * Get service status color
   */
  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'loaded': return '#4CAF50';
      case 'failed': return '#FF9800';
      case 'error': return '#F44336';
      case 'loading': return '#2196F3';
      default: return '#666';
    }
  };

  /**
   * Render service status
   */
  const renderServiceStatus = (serviceName, status) => {
    return (
      <View key={serviceName} style={styles.serviceStatusItem}>
        <Ionicons 
          name={getServiceStatusIcon(status)} 
          size={16} 
          color={getServiceStatusColor(status)} 
        />
        <Text style={styles.serviceStatusText}>
          {getServiceDisplayName(serviceName)}
        </Text>
      </View>
    );
  };

  /**
   * Render initialization progress
   */
  const renderInitializationProgress = () => {
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {initializationState.currentService}
        </Text>
        
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
        </View>
        
        <Text style={styles.progressPercentage}>
          {Math.round(initializationState.progress)}%
        </Text>
      </View>
    );
  };

  /**
   * Render service statuses
   */
  const renderServiceStatuses = () => {
    const services = Object.entries(initializationState.services);
    if (services.length === 0) return null;

    return (
      <View style={styles.servicesContainer}>
        <Text style={styles.servicesTitle}>Services</Text>
        {services.map(([serviceName, status]) => 
          renderServiceStatus(serviceName, status)
        )}
      </View>
    );
  };

  /**
   * Render error state
   */
  const renderErrorState = () => {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorTitle}>Initialization Failed</Text>
        <Text style={styles.errorMessage}>{initializationState.error}</Text>
      </View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        style, 
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="game-controller" size={64} color="#4CAF50" />
          <Text style={styles.title}>ChainLink</Text>
          <Text style={styles.subtitle}>Word Puzzle Game</Text>
        </View>
        
        {initializationState.phase === 'error' ? (
          renderErrorState()
        ) : (
          <>
            {renderInitializationProgress()}
            {renderServiceStatuses()}
          </>
        )}
        
        {initializationState.phase === 'initializing' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#ccc',
  },
  servicesContainer: {
    width: '100%',
    marginBottom: 20,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  serviceStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceStatusText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  loadingContainer: {
    marginTop: 20,
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AppInitializer;
