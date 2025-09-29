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
import { useSeasonal } from '../../hooks/useSeasonal';

/**
 * SeasonalChallenges - Seasonal challenge management screen
 */
const SeasonalChallenges = ({ navigation }) => {
  const seasonal = useSeasonal();
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSeasonalChallenges();
  }, []);

  /**
   * Load seasonal challenges
   */
  const loadSeasonalChallenges = async () => {
    try {
      setLoading(true);
      const [challengesData, completedData] = await Promise.all([
        seasonal.getSeasonalChallenges(),
        seasonal.getCompletedSeasonalChallenges()
      ]);
      
      setChallenges(challengesData);
      setCompletedChallenges(completedData);
    } catch (error) {
      console.error('Failed to load seasonal challenges:', error);
      Alert.alert('Error', 'Failed to load seasonal challenges');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSeasonalChallenges();
    setRefreshing(false);
  };

  /**
   * Complete a seasonal challenge
   */
  const completeSeasonalChallenge = async (challengeId) => {
    try {
      const success = await seasonal.completeSeasonalChallenge(challengeId);
      if (success) {
        setCompletedChallenges(prev => [...prev, challengeId]);
        Alert.alert(
          'Challenge Completed!',
          'Great job! You\'ve completed this seasonal challenge.',
          [{ text: 'Awesome!' }]
        );
      }
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      Alert.alert('Error', 'Failed to complete challenge');
    }
  };

  /**
   * Get challenge progress
   */
  const getChallengeProgress = (challenge) => {
    // This would be calculated based on actual game data
    // For now, return a mock progress
    const isCompleted = completedChallenges.includes(challenge.id);
    return isCompleted ? 100 : Math.floor(Math.random() * 80);
  };

  /**
   * Render individual challenge card
   */
  const renderChallengeCard = (challenge) => {
    const progress = getChallengeProgress(challenge);
    const isCompleted = completedChallenges.includes(challenge.id);
    
    return (
      <View
        key={challenge.id}
        style={[
          styles.challengeCard,
          isCompleted && styles.completedChallenge
        ]}
      >
        {/* Challenge Header */}
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName}>{challenge.name}</Text>
            <Text style={styles.challengeDescription}>
              {challenge.description}
            </Text>
          </View>
          <View style={styles.challengeStatus}>
            {isCompleted ? (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            ) : (
              <Text style={styles.challengeTarget}>
                {challenge.target}
              </Text>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isCompleted ? '#4CAF50' : '#4A90E2'
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {isCompleted ? 'Completed!' : `${progress}% Complete`}
          </Text>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsTitle}>Rewards:</Text>
          <View style={styles.rewardsList}>
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rewardText}>{challenge.reward.coins} coins</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="flash" size={16} color="#4A90E2" />
              <Text style={styles.rewardText}>{challenge.reward.xp} XP</Text>
            </View>
            {challenge.reward.item && (
              <View style={styles.rewardItem}>
                <Ionicons name="gift" size={16} color="#FF6B6B" />
                <Text style={styles.rewardText}>{challenge.reward.item}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        {!isCompleted && progress >= 100 && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => completeSeasonalChallenge(challenge.id)}
          >
            <Text style={styles.completeButtonText}>Complete Challenge</Text>
            <Ionicons name="trophy" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Render header with season info
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.title}>Seasonal Challenges</Text>
        <Text style={styles.subtitle}>
          {seasonal.currentSeason?.name || 'Current Season'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadSeasonalChallenges}
      >
        <Ionicons name="refresh" size={24} color="#4A90E2" />
      </TouchableOpacity>
    </View>
  );

  /**
   * Render challenge stats
   */
  const renderChallengeStats = () => {
    const totalChallenges = challenges.length;
    const completedCount = completedChallenges.length;
    const completionRate = totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Challenge Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedCount}/{totalChallenges}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalChallenges - completedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={64} color="#666" />
      <Text style={styles.emptyTitle}>No Seasonal Challenges</Text>
      <Text style={styles.emptySubtitle}>
        Check back when a new season begins for seasonal challenges!
      </Text>
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading seasonal challenges...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
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
        {loading ? (
          renderLoading()
        ) : challenges.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderChallengeStats()}
            <View style={styles.challengesContainer}>
              <Text style={styles.sectionTitle}>Available Challenges</Text>
              {challenges.map(renderChallengeCard)}
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Complete challenges to earn exclusive seasonal rewards!
        </Text>
      </View>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 20,
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
  challengesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedChallenge: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  challengeStatus: {
    alignItems: 'center',
    marginLeft: 12,
  },
  challengeTarget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  rewardsContainer: {
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default SeasonalChallenges;
