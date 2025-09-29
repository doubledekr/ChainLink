import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * DailyChallengeCard - Individual daily challenge card component
 */
const DailyChallengeCard = ({ challenge, onClaim, showClaimButton = true }) => {
  /**
   * Get progress percentage
   */
  const getProgressPercentage = () => {
    return Math.min((challenge.progress / challenge.target) * 100, 100);
  };

  /**
   * Get progress bar color
   */
  const getProgressBarColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return '#4CAF50'; // Green for completed
    if (percentage >= 80) return '#FFA726'; // Orange for near completion
    return challenge.color; // Default challenge color
  };

  /**
   * Format progress text
   */
  const formatProgressText = () => {
    if (challenge.completed) {
      return 'Completed!';
    }
    return `${challenge.progress}/${challenge.target}`;
  };

  /**
   * Handle claim button press
   */
  const handleClaim = () => {
    if (challenge.completed && !challenge.claimed && onClaim) {
      onClaim(challenge.id);
    }
  };

  /**
   * Render reward section
   */
  const renderReward = () => (
    <View style={styles.rewardContainer}>
      <View style={styles.rewardItem}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.rewardText}>{challenge.reward.coins}</Text>
      </View>
      <View style={styles.rewardItem}>
        <Ionicons name="flash" size={16} color="#4A90E2" />
        <Text style={styles.rewardText}>{challenge.reward.xp}</Text>
      </View>
    </View>
  );

  /**
   * Render claim button
   */
  const renderClaimButton = () => {
    if (!challenge.completed || challenge.claimed || !showClaimButton) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.claimButton}
        onPress={handleClaim}
      >
        <Text style={styles.claimButtonText}>Claim Reward</Text>
        <Ionicons name="gift" size={16} color="#fff" />
      </TouchableOpacity>
    );
  };

  /**
   * Render completion status
   */
  const renderCompletionStatus = () => {
    if (challenge.claimed) {
      return (
        <View style={styles.completedStatus}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.completedText}>Reward Claimed</Text>
        </View>
      );
    }

    if (challenge.completed) {
      return (
        <View style={styles.completedStatus}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.completedText}>Challenge Complete!</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[
      styles.container,
      challenge.completed && styles.completedContainer,
      challenge.claimed && styles.claimedContainer
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: challenge.color }]}>
            <Ionicons name={challenge.icon} size={20} color="#fff" />
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>{challenge.name}</Text>
            <Text style={styles.description}>{challenge.description}</Text>
          </View>
        </View>
        {renderCompletionStatus()}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${getProgressPercentage()}%`,
                backgroundColor: getProgressBarColor()
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{formatProgressText()}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {renderReward()}
        {renderClaimButton()}
      </View>

      {/* Difficulty Badge */}
      <View style={[styles.difficultyBadge, { backgroundColor: challenge.color }]}>
        <Text style={styles.difficultyText}>
          {challenge.difficulty.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  completedContainer: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  claimedContainer: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: '#FFF9C4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default DailyChallengeCard;
