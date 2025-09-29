import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDailyChallenges } from '../../hooks/useDailyChallenges';

/**
 * ChallengeProgressOverlay - Compact challenge progress overlay during gameplay
 */
const ChallengeProgressOverlay = ({ visible, onClose, onChallengePress }) => {
  const dailyChallenges = useDailyChallenges();
  const [challenges, setChallenges] = useState([]);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadChallenges();
      showOverlay();
    } else {
      hideOverlay();
    }
  }, [visible]);

  useEffect(() => {
    if (dailyChallenges.isInitialized) {
      loadChallenges();
    }
  }, [dailyChallenges.isInitialized]);

  /**
   * Load current challenges
   */
  const loadChallenges = async () => {
    try {
      const currentChallenges = await dailyChallenges.getTodaysChallenges();
      setChallenges(currentChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  /**
   * Show overlay with animation
   */
  const showOverlay = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Hide overlay with animation
   */
  const hideOverlay = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Handle challenge press
   */
  const handleChallengePress = (challenge) => {
    if (onChallengePress) {
      onChallengePress(challenge);
    }
  };

  /**
   * Get progress percentage for a challenge
   */
  const getProgressPercentage = (challenge) => {
    return Math.min((challenge.progress / challenge.target) * 100, 100);
  };

  /**
   * Render individual challenge item
   */
  const renderChallengeItem = (challenge) => {
    const progress = getProgressPercentage(challenge);
    const isCompleted = challenge.completed;
    const isClaimed = challenge.claimed;

    return (
      <TouchableOpacity
        key={challenge.id}
        style={[
          styles.challengeItem,
          isCompleted && styles.completedChallenge,
          isClaimed && styles.claimedChallenge
        ]}
        onPress={() => handleChallengePress(challenge)}
      >
        <View style={styles.challengeHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: challenge.color }
          ]}>
            <Ionicons name={challenge.icon} size={16} color="#fff" />
          </View>
          
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName} numberOfLines={1}>
              {challenge.name}
            </Text>
            <Text style={styles.challengeDescription} numberOfLines={1}>
              {challenge.description}
            </Text>
          </View>
          
          <View style={styles.challengeStatus}>
            {isClaimed ? (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            ) : isCompleted ? (
              <Ionicons name="gift" size={20} color="#FFD700" />
            ) : (
              <Text style={styles.progressText}>
                {challenge.progress}/{challenge.target}
              </Text>
            )}
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: challenge.color
                }
              ]}
            />
          </View>
        </View>
        
        {/* Reward Info */}
        <View style={styles.rewardContainer}>
          <View style={styles.rewardItem}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.rewardText}>{challenge.reward.coins}</Text>
          </View>
          <View style={styles.rewardItem}>
            <Ionicons name="flash" size={12} color="#4A90E2" />
            <Text style={styles.rewardText}>{challenge.reward.xp}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render stats summary
   */
  const renderStatsSummary = () => {
    const completed = challenges.filter(c => c.completed).length;
    const total = challenges.length;
    const claimed = challenges.filter(c => c.claimed).length;

    return (
      <View style={styles.statsSummary}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completed}/{total}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{claimed}</Text>
          <Text style={styles.statLabel}>Claimed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dailyChallenges.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.headerTitle}>Daily Challenges</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        {renderStatsSummary()}

        {/* Challenges List */}
        <ScrollView 
          style={styles.challengesList}
          showsVerticalScrollIndicator={false}
        >
          {challenges.map(renderChallengeItem)}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tap a challenge to claim rewards
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlay: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  challengesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  challengeItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  completedChallenge: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  claimedChallenge: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF9C4',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  challengeDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  challengeStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  rewardContainer: {
    flexDirection: 'row',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ChallengeProgressOverlay;
