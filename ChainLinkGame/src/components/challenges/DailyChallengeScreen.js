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
import DailyChallengeCard from './DailyChallengeCard';
import { useDailyChallenges } from '../../hooks/useDailyChallenges';
import { useUserProfile } from '../../hooks/useUserProfile';

/**
 * DailyChallengeScreen - Main daily challenges screen
 */
const DailyChallengeScreen = ({ navigation }) => {
  const dailyChallenges = useDailyChallenges();
  const userProfile = useUserProfile();
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallengesData();
  }, []);

  /**
   * Load all challenges data
   */
  const loadChallengesData = async () => {
    try {
      setLoading(true);
      
      const [challengesData, statsData, streakData] = await Promise.all([
        dailyChallenges.getTodaysChallenges(),
        dailyChallenges.getChallengeStats(),
        dailyChallenges.getChallengeStreak()
      ]);
      
      setChallenges(challengesData);
      setStats(statsData);
      setStreak(streakData);
      
    } catch (error) {
      console.error('Failed to load challenges data:', error);
      Alert.alert('Error', 'Failed to load daily challenges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallengesData();
  };

  /**
   * Handle challenge reward claim
   */
  const handleClaimReward = async (challengeId) => {
    try {
      const reward = await dailyChallenges.claimChallengeReward(challengeId);
      
      if (reward) {
        // Update local state
        setChallenges(prev => 
          prev.map(c => 
            c.id === challengeId 
              ? { ...c, claimed: true }
              : c
          )
        );
        
        // Refresh stats
        const newStats = await dailyChallenges.getChallengeStats();
        setStats(newStats);
        
        Alert.alert(
          'Reward Claimed!',
          `You earned ${reward.coins} coins and ${reward.xp} XP!`,
          [{ text: 'Awesome!' }]
        );
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    }
  };

  /**
   * Claim all available rewards
   */
  const claimAllRewards = async () => {
    try {
      const unclaimedChallenges = challenges.filter(c => c.completed && !c.claimed);
      
      if (unclaimedChallenges.length === 0) {
        Alert.alert('No Rewards', 'No rewards available to claim');
        return;
      }
      
      let totalCoins = 0;
      let totalXP = 0;
      
      for (const challenge of unclaimedChallenges) {
        const reward = await dailyChallenges.claimChallengeReward(challenge.id);
        if (reward) {
          totalCoins += reward.coins;
          totalXP += reward.xp;
        }
      }
      
      // Update local state
      setChallenges(prev => 
        prev.map(c => 
          unclaimedChallenges.some(uc => uc.id === c.id)
            ? { ...c, claimed: true }
            : c
        )
      );
      
      // Refresh stats
      const newStats = await dailyChallenges.getChallengeStats();
      setStats(newStats);
      
      Alert.alert(
        'All Rewards Claimed!',
        `You earned ${totalCoins} coins and ${totalXP} XP!`,
        [{ text: 'Awesome!' }]
      );
      
    } catch (error) {
      console.error('Failed to claim all rewards:', error);
      Alert.alert('Error', 'Failed to claim rewards. Please try again.');
    }
  };

  /**
   * Render header with stats
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Daily Challenges</Text>
      <TouchableOpacity
        style={styles.claimAllButton}
        onPress={claimAllRewards}
        disabled={!stats || stats.completed === stats.claimed}
      >
        <Ionicons name="gift" size={24} color="#4A90E2" />
      </TouchableOpacity>
    </View>
  );

  /**
   * Render challenge streak section
   */
  const renderStreakSection = () => (
    <View style={styles.streakContainer}>
      <View style={styles.streakHeader}>
        <Ionicons name="flame" size={24} color="#FF6B6B" />
        <Text style={styles.streakTitle}>Challenge Streak</Text>
      </View>
      <Text style={styles.streakValue}>{streak} days</Text>
      <Text style={styles.streakSubtitle}>
        Complete at least one challenge daily to maintain your streak!
      </Text>
    </View>
  );

  /**
   * Render stats section
   */
  const renderStatsSection = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today's Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}/{stats.total}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.claimed}</Text>
            <Text style={styles.statLabel}>Claimed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalReward}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(stats.completionRate)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render challenge list
   */
  const renderChallengeList = () => {
    if (challenges.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>No Challenges Today</Text>
          <Text style={styles.emptySubtitle}>
            Check back tomorrow for new daily challenges!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.challengesContainer}>
        <Text style={styles.sectionTitle}>Today's Challenges</Text>
        {challenges.map((challenge) => (
          <DailyChallengeCard
            key={challenge.id}
            challenge={challenge}
            onClaim={handleClaimReward}
            showClaimButton={true}
          />
        ))}
      </View>
    );
  };

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading challenges...</Text>
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
        ) : (
          <>
            {renderStreakSection()}
            {renderStatsSection()}
            {renderChallengeList()}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Challenges reset daily at midnight
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  claimAllButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  streakContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
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
    fontSize: 24,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
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

export default DailyChallengeScreen;
