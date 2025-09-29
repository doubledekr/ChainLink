import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RewardService from '../../services/RewardService';
import AchievementService from '../../services/AchievementService';

const { width, height } = Dimensions.get('window');

/**
 * RewardScreen - Daily rewards and milestone rewards screen
 */
const RewardScreen = ({ 
  onBack, 
  playerLevel = 1,
  style 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [rewardService, setRewardService] = useState(null);
  const [achievementService, setAchievementService] = useState(null);
  const [dailyRewardStatus, setDailyRewardStatus] = useState(null);
  const [milestoneRewards, setMilestoneRewards] = useState([]);
  const [recentRewards, setRecentRewards] = useState([]);
  const [rewardStats, setRewardStats] = useState(null);
  const [selectedTab, setSelectedTab] = useState('daily');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeServices();
  }, []);

  useEffect(() => {
    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  /**
   * Initialize services
   */
  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Initialize services
      const reward = new RewardService();
      const achievement = new AchievementService();
      
      await Promise.all([
        reward.initialize(),
        achievement.initialize()
      ]);
      
      setRewardService(reward);
      setAchievementService(achievement);
      
      // Load reward data
      const dailyStatus = reward.getDailyRewardStatus();
      const milestones = await reward.checkMilestoneRewards(playerLevel);
      const recent = reward.getRecentRewards();
      const stats = reward.getRewardStats();
      
      setDailyRewardStatus(dailyStatus);
      setMilestoneRewards(milestones);
      setRecentRewards(recent);
      setRewardStats(stats);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize reward services:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle daily reward claim
   */
  const handleDailyRewardClaim = async () => {
    try {
      setIsLoading(true);
      
      const result = await rewardService.claimDailyReward();
      
      if (result.success) {
        Alert.alert(
          'Daily Reward Claimed!',
          `You received ${result.reward.coins} coins and ${result.reward.hints} hints!`,
          [{ text: 'OK' }]
        );
        
        // Refresh data
        const newStatus = rewardService.getDailyRewardStatus();
        const newStats = rewardService.getRewardStats();
        
        setDailyRewardStatus(newStatus);
        setRewardStats(newStats);
      } else {
        Alert.alert(
          'Reward Already Claimed',
          'You have already claimed your daily reward today. Come back tomorrow!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Daily reward claim failed:', error);
      Alert.alert(
        'Claim Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle milestone reward claim
   */
  const handleMilestoneRewardClaim = async (milestone) => {
    try {
      setIsLoading(true);
      
      const result = await rewardService.claimMilestoneReward(milestone.milestone);
      
      if (result.success) {
        Alert.alert(
          'Milestone Reward Claimed!',
          `You received milestone rewards for reaching level ${milestone.level}!`,
          [{ text: 'OK' }]
        );
        
        // Refresh data
        const newMilestones = await rewardService.checkMilestoneRewards(playerLevel);
        const newStats = rewardService.getRewardStats();
        
        setMilestoneRewards(newMilestones);
        setRewardStats(newStats);
      } else {
        Alert.alert(
          'Claim Failed',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Milestone reward claim failed:', error);
      Alert.alert(
        'Claim Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render daily reward section
   */
  const renderDailyReward = () => {
    if (!dailyRewardStatus) return null;

    const canClaim = dailyRewardStatus.canClaim;
    const streak = dailyRewardStatus.streak;
    const nextRewardTime = dailyRewardStatus.nextRewardTime;

    return (
      <View style={styles.dailyRewardContainer}>
        <Text style={styles.sectionTitle}>Daily Reward</Text>
        
        <View style={styles.dailyRewardCard}>
          <View style={styles.dailyRewardHeader}>
            <Ionicons name="gift" size={32} color="#FFD700" />
            <Text style={styles.dailyRewardTitle}>Daily Bonus</Text>
          </View>
          
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakValue}>{streak} days</Text>
          </View>
          
          {canClaim ? (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleDailyRewardClaim}
              activeOpacity={0.7}
            >
              <Ionicons name="gift" size={20} color="#fff" />
              <Text style={styles.claimButtonText}>Claim Daily Reward</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.claimedContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.claimedText}>Already claimed today</Text>
            </View>
          )}
          
          <Text style={styles.nextRewardText}>
            Next reward available in {this.formatTimeUntil(nextRewardTime)}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * Render milestone rewards section
   */
  const renderMilestoneRewards = () => {
    if (!milestoneRewards || milestoneRewards.length === 0) {
      return (
        <View style={styles.milestoneRewardsContainer}>
          <Text style={styles.sectionTitle}>Milestone Rewards</Text>
          <View style={styles.noRewardsContainer}>
            <Ionicons name="trophy" size={48} color="#666" />
            <Text style={styles.noRewardsText}>No milestone rewards available</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.milestoneRewardsContainer}>
        <Text style={styles.sectionTitle}>Milestone Rewards</Text>
        
        {milestoneRewards.map((milestone, index) => (
          <View key={index} style={styles.milestoneRewardCard}>
            <View style={styles.milestoneHeader}>
              <View style={styles.milestoneIcon}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
              </View>
              
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>Level {milestone.level} Reward</Text>
                <Text style={styles.milestoneDescription}>
                  Congratulations on reaching level {milestone.level}!
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.milestoneClaimButton}
                onPress={() => handleMilestoneRewardClaim(milestone)}
                activeOpacity={0.7}
              >
                <Text style={styles.milestoneClaimButtonText}>Claim</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.milestoneRewards}>
              {Object.entries(milestone.reward).map(([type, amount]) => (
                <View key={type} style={styles.milestoneRewardItem}>
                  <Ionicons 
                    name={this.getRewardIcon(type)} 
                    size={16} 
                    color={this.getRewardColor(type)} 
                  />
                  <Text style={styles.milestoneRewardText}>
                    {amount} {this.getRewardLabel(type)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render recent rewards section
   */
  const renderRecentRewards = () => {
    if (!recentRewards || recentRewards.length === 0) {
      return (
        <View style={styles.recentRewardsContainer}>
          <Text style={styles.sectionTitle}>Recent Rewards</Text>
          <View style={styles.noRewardsContainer}>
            <Ionicons name="time" size={48} color="#666" />
            <Text style={styles.noRewardsText}>No recent rewards</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.recentRewardsContainer}>
        <Text style={styles.sectionTitle}>Recent Rewards</Text>
        
        {recentRewards.map((reward, index) => (
          <View key={index} style={styles.recentRewardCard}>
            <View style={styles.recentRewardHeader}>
              <Ionicons 
                name={this.getRewardSourceIcon(reward.source)} 
                size={20} 
                color={this.getRewardSourceColor(reward.source)} 
              />
              <Text style={styles.recentRewardSource}>
                {this.getRewardSourceLabel(reward.source)}
              </Text>
              <Text style={styles.recentRewardTime}>
                {new Date(reward.timestamp).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.recentRewardItems}>
              {Object.entries(reward.reward).map(([type, amount]) => (
                <View key={type} style={styles.recentRewardItem}>
                  <Ionicons 
                    name={this.getRewardIcon(type)} 
                    size={16} 
                    color={this.getRewardColor(type)} 
                  />
                  <Text style={styles.recentRewardText}>
                    {amount} {this.getRewardLabel(type)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render reward statistics
   */
  const renderRewardStats = () => {
    if (!rewardStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Reward Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rewardStats.totalRewardsClaimed}</Text>
            <Text style={styles.statLabel}>Total Rewards</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rewardStats.dailyStreak}</Text>
            <Text style={styles.statLabel}>Daily Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rewardStats.milestoneRewardsClaimed}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rewardStats.specialRewardsClaimed}</Text>
            <Text style={styles.statLabel}>Special</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render tab content
   */
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'daily':
        return renderDailyReward();
      case 'milestones':
        return renderMilestoneRewards();
      case 'recent':
        return renderRecentRewards();
      default:
        return renderDailyReward();
    }
  };

  /**
   * Get reward icon
   */
  getRewardIcon = (type) => {
    switch (type) {
      case 'coins': return 'logo-bitcoin';
      case 'hints': return 'bulb';
      case 'lives': return 'heart';
      case 'themes': return 'color-palette';
      case 'avatars': return 'person';
      case 'xp': return 'star';
      case 'boosters': return 'rocket';
      default: return 'gift';
    }
  };

  /**
   * Get reward color
   */
  getRewardColor = (type) => {
    switch (type) {
      case 'coins': return '#FFD700';
      case 'hints': return '#FFD700';
      case 'lives': return '#FF6B6B';
      case 'themes': return '#9C27B0';
      case 'avatars': return '#2196F3';
      case 'xp': return '#4CAF50';
      case 'boosters': return '#FF9800';
      default: return '#666';
    }
  };

  /**
   * Get reward label
   */
  getRewardLabel = (type) => {
    switch (type) {
      case 'coins': return 'Coins';
      case 'hints': return 'Hints';
      case 'lives': return 'Lives';
      case 'themes': return 'Themes';
      case 'avatars': return 'Avatars';
      case 'xp': return 'XP';
      case 'boosters': return 'Boosters';
      default: return type;
    }
  };

  /**
   * Get reward source icon
   */
  getRewardSourceIcon = (source) => {
    switch (source) {
      case 'daily': return 'calendar';
      case 'milestone': return 'trophy';
      case 'achievement': return 'medal';
      case 'seasonal': return 'snow';
      case 'event': return 'gift';
      case 'purchase': return 'card';
      case 'ad': return 'megaphone';
      default: return 'gift';
    }
  };

  /**
   * Get reward source color
   */
  getRewardSourceColor = (source) => {
    switch (source) {
      case 'daily': return '#4CAF50';
      case 'milestone': return '#FFD700';
      case 'achievement': return '#9C27B0';
      case 'seasonal': return '#E91E63';
      case 'event': return '#FF6B6B';
      case 'purchase': return '#2196F3';
      case 'ad': return '#FF9800';
      default: return '#666';
    }
  };

  /**
   * Get reward source label
   */
  getRewardSourceLabel = (source) => {
    switch (source) {
      case 'daily': return 'Daily Reward';
      case 'milestone': return 'Milestone';
      case 'achievement': return 'Achievement';
      case 'seasonal': return 'Seasonal';
      case 'event': return 'Event';
      case 'purchase': return 'Purchase';
      case 'ad': return 'Ad Reward';
      default: return source;
    }
  };

  /**
   * Format time until next reward
   */
  formatTimeUntil = (timestamp) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewards</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>
      
      {renderRewardStats()}
      
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'daily', label: 'Daily', icon: 'calendar' },
            { id: 'milestones', label: 'Milestones', icon: 'trophy' },
            { id: 'recent', label: 'Recent', icon: 'time' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                selectedTab === tab.id && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.id ? '#fff' : '#ccc'} 
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTabContent()}
      </ScrollView>
    </Animated.View>
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
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  tabContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  dailyRewardContainer: {
    marginBottom: 20,
  },
  dailyRewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  dailyRewardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dailyRewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  claimedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  claimedText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
  },
  nextRewardText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  milestoneRewardsContainer: {
    marginBottom: 20,
  },
  milestoneRewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  milestoneClaimButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  milestoneClaimButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  milestoneRewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  milestoneRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  milestoneRewardText: {
    fontSize: 12,
    color: '#ccc',
    marginLeft: 4,
  },
  recentRewardsContainer: {
    marginBottom: 20,
  },
  recentRewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  recentRewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentRewardSource: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  recentRewardTime: {
    fontSize: 12,
    color: '#ccc',
  },
  recentRewardItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  recentRewardText: {
    fontSize: 12,
    color: '#ccc',
    marginLeft: 4,
  },
  noRewardsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noRewardsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default RewardScreen;
