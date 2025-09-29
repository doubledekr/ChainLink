import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeatureFlagService from '../../services/FeatureFlagService';

const { width } = Dimensions.get('window');

/**
 * FeatureFlagDebugger - Debug interface for feature flags
 * Allows developers to test different feature flag configurations
 */
const FeatureFlagDebugger = ({ 
  onBack, 
  style 
}) => {
  const [featureFlagService, setFeatureFlagService] = useState(null);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDebugger();
  }, []);

  /**
   * Initialize the debugger
   */
  const initializeDebugger = async () => {
    try {
      setIsLoading(true);
      
      // Create feature flag service
      const service = new FeatureFlagService();
      await service.initialize();
      
      setFeatureFlagService(service);
      
      // Load feature flags and analytics
      const flags = service.getAllFeatureFlags();
      const analyticsData = service.getFeatureFlagAnalytics();
      
      setFeatureFlags(flags);
      setAnalytics(analyticsData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize feature flag debugger:', error);
      setIsLoading(false);
    }
  };

  /**
   * Toggle feature flag
   */
  const toggleFeatureFlag = (flagKey, enabled) => {
    if (!featureFlagService) return;

    try {
      featureFlagService.updateFeatureFlag(flagKey, { enabled });
      
      // Refresh data
      const flags = featureFlagService.getAllFeatureFlags();
      const analyticsData = featureFlagService.getFeatureFlagAnalytics();
      
      setFeatureFlags(flags);
      setAnalytics(analyticsData);
      
      console.log(`Feature flag ${flagKey} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
      Alert.alert('Error', 'Failed to update feature flag');
    }
  };

  /**
   * Update rollout percentage
   */
  const updateRolloutPercentage = (flagKey, percentage) => {
    if (!featureFlagService) return;

    try {
      featureFlagService.updateFeatureFlag(flagKey, { 
        rolloutPercentage: Math.max(0, Math.min(100, percentage)) 
      });
      
      // Refresh data
      const flags = featureFlagService.getAllFeatureFlags();
      setFeatureFlags(flags);
      
      console.log(`Feature flag ${flagKey} rollout updated to ${percentage}%`);
    } catch (error) {
      console.error('Failed to update rollout percentage:', error);
      Alert.alert('Error', 'Failed to update rollout percentage');
    }
  };

  /**
   * Reset feature flag to default
   */
  const resetFeatureFlag = (flagKey) => {
    Alert.alert(
      'Reset Feature Flag',
      `Are you sure you want to reset ${flagKey} to default settings?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            if (!featureFlagService) return;
            
            try {
              // Reset to default values
              featureFlagService.updateFeatureFlag(flagKey, {
                enabled: false,
                rolloutPercentage: 0
              });
              
              // Refresh data
              const flags = featureFlagService.getAllFeatureFlags();
              const analyticsData = featureFlagService.getFeatureFlagAnalytics();
              
              setFeatureFlags(flags);
              setAnalytics(analyticsData);
              
              console.log(`Feature flag ${flagKey} reset to defaults`);
            } catch (error) {
              console.error('Failed to reset feature flag:', error);
              Alert.alert('Error', 'Failed to reset feature flag');
            }
          }
        }
      ]
    );
  };

  /**
   * Get filtered feature flags
   */
  const getFilteredFeatureFlags = () => {
    if (selectedCategory === 'all') {
      return featureFlags;
    }
    
    return featureFlags.filter(flag => {
      if (selectedCategory === 'core') {
        return !flag.key.includes('ui_variant') && 
               !flag.key.includes('onboarding') &&
               !flag.key.includes('social') &&
               !flag.key.includes('multiplayer') &&
               !flag.key.includes('lightning_pass') &&
               !flag.key.includes('cloud') &&
               !flag.key.includes('ai_') &&
               !flag.key.includes('custom_') &&
               !flag.key.includes('regional') &&
               !flag.key.includes('localization') &&
               !flag.key.includes('offline') &&
               !flag.key.includes('analytics');
      }
      
      return flag.key.includes(selectedCategory);
    });
  };

  /**
   * Get category display name
   */
  const getCategoryDisplayName = (category) => {
    const displayNames = {
      all: 'All',
      core: 'Core',
      premium: 'Premium',
      beta: 'Beta',
      experimental: 'Experimental',
      regional: 'Regional',
      performance: 'Performance',
      ab_testing: 'A/B Testing'
    };
    
    return displayNames[category] || category;
  };

  /**
   * Render feature flag card
   */
  const renderFeatureFlagCard = (flag) => {
    const isEnabled = featureFlagService?.isFeatureEnabled(flag.key) || false;
    
    return (
      <View key={flag.key} style={styles.flagCard}>
        <View style={styles.flagHeader}>
          <View style={styles.flagInfo}>
            <Text style={styles.flagName}>{flag.key}</Text>
            <Text style={styles.flagDescription}>{flag.description}</Text>
          </View>
          
          <View style={styles.flagControls}>
            <Switch
              value={flag.enabled}
              onValueChange={(enabled) => toggleFeatureFlag(flag.key, enabled)}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={flag.enabled ? '#fff' : '#ccc'}
            />
          </View>
        </View>
        
        <View style={styles.flagDetails}>
          <View style={styles.flagDetailItem}>
            <Text style={styles.flagDetailLabel}>Rollout:</Text>
            <Text style={styles.flagDetailValue}>{flag.rolloutPercentage}%</Text>
          </View>
          
          <View style={styles.flagDetailItem}>
            <Text style={styles.flagDetailLabel}>Status:</Text>
            <Text style={[
              styles.flagDetailValue,
              { color: isEnabled ? '#4CAF50' : '#F44336' }
            ]}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          
          <View style={styles.flagDetailItem}>
            <Text style={styles.flagDetailLabel}>Version:</Text>
            <Text style={styles.flagDetailValue}>{flag.minVersion}</Text>
          </View>
        </View>
        
        <View style={styles.flagActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => resetFeatureFlag(flag.key)}
          >
            <Ionicons name="refresh" size={16} color="#FF9800" />
            <Text style={styles.actionButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Render analytics summary
   */
  const renderAnalyticsSummary = () => {
    if (!analytics) return null;

    return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.analyticsTitle}>Feature Flag Analytics</Text>
        
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.totalFlags}</Text>
            <Text style={styles.analyticsLabel}>Total Flags</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.enabledFlags}</Text>
            <Text style={styles.analyticsLabel}>Enabled</Text>
          </View>
          
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.enabledPercentage}%</Text>
            <Text style={styles.analyticsLabel}>Enabled %</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render category tabs
   */
  const renderCategoryTabs = () => {
    const categories = ['all', 'core', 'premium', 'beta', 'experimental', 'regional', 'performance', 'ab_testing'];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.tabButton,
              selectedCategory === category && styles.activeTab
            ]}
            onPress={() => setSelectedCategory(category)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              selectedCategory === category && styles.activeTabText
            ]}>
              {getCategoryDisplayName(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feature Flag Debugger</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading feature flags...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feature Flag Debugger</Text>
      </View>
      
      {renderAnalyticsSummary()}
      {renderCategoryTabs()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {getFilteredFeatureFlags().map(renderFeatureFlagCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ccc',
  },
  analyticsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  tabsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    color: '#ccc',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  flagCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  flagInfo: {
    flex: 1,
    marginRight: 16,
  },
  flagName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  flagControls: {
    alignItems: 'center',
  },
  flagDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flagDetailItem: {
    alignItems: 'center',
  },
  flagDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  flagDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  flagActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default FeatureFlagDebugger;
