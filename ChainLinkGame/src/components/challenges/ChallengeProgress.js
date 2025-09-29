import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DailyChallengeCard from './DailyChallengeCard';
import { useDailyChallenges } from '../../hooks/useDailyChallenges';

/**
 * ChallengeProgress - Challenge progress overlay during gameplay
 */
const ChallengeProgress = ({ visible, onClose, onChallengeUpdate }) => {
  const dailyChallenges = useDailyChallenges();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadChallenges();
    }
  }, [visible]);

  /**
   * Load current challenges
   */
  const loadChallenges = async () => {
    try {
      setLoading(true);
      const currentChallenges = await dailyChallenges.getTodaysChallenges();
      setChallenges(currentChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
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
        
        // Notify parent component
        if (onChallengeUpdate) {
          onChallengeUpdate();
        }
        
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
   * Render challenge stats header
   */
  const renderStatsHeader = () => {
    const completed = challenges.filter(c => c.completed).length;
    const total = challenges.length;
    const claimed = challenges.filter(c => c.claimed).length;
    const totalReward = challenges
      .filter(c => c.claimed)
      .reduce((sum, c) => sum + c.reward.coins, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completed}/{total}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{claimed}</Text>
            <Text style={styles.statLabel}>Claimed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalReward}</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
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
      <Text style={styles.emptyTitle}>No Challenges Today</Text>
      <Text style={styles.emptySubtitle}>
        Check back tomorrow for new daily challenges!
      </Text>
    </View>
  );

  /**
   * Render challenge list
   */
  const renderChallengeList = () => (
    <ScrollView 
      style={styles.challengeList}
      showsVerticalScrollIndicator={false}
    >
      {challenges.map((challenge) => (
        <DailyChallengeCard
          key={challenge.id}
          challenge={challenge}
          onClaim={handleClaimReward}
          showClaimButton={true}
        />
      ))}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Challenges</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadChallenges}
          >
            <Ionicons name="refresh" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Stats Header */}
        {!loading && challenges.length > 0 && renderStatsHeader()}

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading challenges...</Text>
            </View>
          ) : challenges.length === 0 ? (
            renderEmptyState()
          ) : (
            renderChallengeList()
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Challenges reset daily at midnight
          </Text>
        </View>
      </View>
    </Modal>
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  closeButton: {
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
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  challengeList: {
    flex: 1,
    paddingTop: 16,
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

export default ChallengeProgress;
