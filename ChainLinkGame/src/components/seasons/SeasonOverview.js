import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSeasonal } from '../../hooks/useSeasonal';
import { useTheme } from '../../hooks/useTheme';

/**
 * SeasonOverview - Main seasonal content overview screen
 */
const SeasonOverview = ({ navigation }) => {
  const seasonal = useSeasonal();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSeasonData();
  }, []);

  /**
   * Load seasonal data
   */
  const loadSeasonData = async () => {
    try {
      setLoading(true);
      await seasonal.loadCurrentSeason();
    } catch (error) {
      console.error('Failed to load season data:', error);
      Alert.alert('Error', 'Failed to load seasonal content');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSeasonData();
    setRefreshing(false);
  };

  /**
   * Navigate to seasonal challenges
   */
  const navigateToSeasonalChallenges = () => {
    navigation.navigate('SeasonalChallenges');
  };

  /**
   * Navigate to theme selection
   */
  const navigateToThemeSelection = () => {
    navigation.navigate('ThemeSelection');
  };

  /**
   * Apply seasonal theme
   */
  const applySeasonalTheme = async () => {
    try {
      const success = await seasonal.applySeasonalTheme();
      if (success) {
        Alert.alert(
          'Theme Applied!',
          `Applied ${seasonal.currentSeason?.name} theme`,
          [{ text: 'Awesome!' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply seasonal theme');
    }
  };

  /**
   * Render season header with gradient
   */
  const renderSeasonHeader = () => {
    if (!seasonal.currentSeason) return null;

    const seasonColors = seasonal.currentSeason.colors;
    
    return (
      <LinearGradient
        colors={[seasonColors.primary, seasonColors.secondary]}
        style={styles.seasonHeader}
      >
        <View style={styles.seasonHeaderContent}>
          <View style={styles.seasonInfo}>
            <Text style={styles.seasonName}>{seasonal.currentSeason.name}</Text>
            <Text style={styles.seasonDescription}>
              {seasonal.currentSeason.description}
            </Text>
          </View>
          <View style={styles.seasonIcon}>
            <Ionicons 
              name={getSeasonIcon(seasonal.currentSeason.id)} 
              size={48} 
              color="#fff" 
            />
          </View>
        </View>
        
        {/* Season Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Season Progress</Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${seasonal.seasonProgress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(seasonal.seasonProgress)}% Complete
          </Text>
        </View>
      </LinearGradient>
    );
  };

  /**
   * Get season icon
   */
  const getSeasonIcon = (seasonId) => {
    switch (seasonId) {
      case 'winter_wonderland':
        return 'snow';
      case 'spring_bloom':
        return 'flower';
      case 'summer_heat':
        return 'sunny';
      case 'autumn_harvest':
        return 'leaf';
      default:
        return 'calendar';
    }
  };

  /**
   * Render season stats
   */
  const renderSeasonStats = () => {
    if (!seasonal.seasonStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Season Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seasonal.seasonStats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seasonal.seasonStats.challengesCompleted}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seasonal.seasonStats.bestScore}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seasonal.seasonStats.totalXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render season actions
   */
  const renderSeasonActions = () => {
    if (!seasonal.currentSeason) return null;

    return (
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Season Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToSeasonalChallenges}
        >
          <View style={styles.actionContent}>
            <View style={styles.actionIcon}>
              <Ionicons name="trophy" size={24} color="#fff" />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Seasonal Challenges</Text>
              <Text style={styles.actionDescription}>
                Complete seasonal challenges for exclusive rewards
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToThemeSelection}
        >
          <View style={styles.actionContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF6B6B' }]}>
              <Ionicons name="color-palette" size={24} color="#fff" />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Seasonal Themes</Text>
              <Text style={styles.actionDescription}>
                Customize your experience with seasonal themes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={applySeasonalTheme}
        >
          <View style={styles.actionContent}>
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark" size={24} color="#fff" />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Apply Theme</Text>
              <Text style={styles.actionDescription}>
                Apply {seasonal.currentSeason?.name} theme to your game
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render time remaining
   */
  const renderTimeRemaining = () => {
    const daysRemaining = seasonal.daysUntilSeasonEnds;
    
    return (
      <View style={styles.timeRemainingContainer}>
        <View style={styles.timeRemainingHeader}>
          <Ionicons name="time" size={20} color="#666" />
          <Text style={styles.timeRemainingTitle}>Season Ends In</Text>
        </View>
        <Text style={styles.timeRemainingValue}>
          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.timeRemainingSubtitle}>
          Complete challenges before the season ends!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Seasonal Content</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadSeasonData}
        >
          <Ionicons name="refresh" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
      >
        {/* Season Header */}
        {renderSeasonHeader()}

        {/* Time Remaining */}
        {renderTimeRemaining()}

        {/* Season Stats */}
        {renderSeasonStats()}

        {/* Season Actions */}
        {renderSeasonActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  seasonHeader: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  seasonHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seasonInfo: {
    flex: 1,
  },
  seasonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  seasonDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 18,
  },
  seasonIcon: {
    marginLeft: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
  timeRemainingContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  timeRemainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeRemainingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  timeRemainingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  timeRemainingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});

export default SeasonOverview;
