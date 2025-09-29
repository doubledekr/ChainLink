import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * LeaderboardEntry - Individual leaderboard entry component
 */
const LeaderboardEntry = ({ entry, rank, isCurrentPlayer }) => {
  /**
   * Get rank display color
   */
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#666';
    }
  };

  /**
   * Get rank icon
   */
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return 'trophy';
      case 2:
        return 'medal';
      case 3:
        return 'medal';
      default:
        return null;
    }
  };

  /**
   * Format score with commas
   */
  const formatScore = (score) => {
    return score.toLocaleString();
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View style={[
      styles.container,
      isCurrentPlayer && styles.currentPlayerContainer
    ]}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        {rank <= 3 ? (
          <Ionicons
            name={getRankIcon(rank)}
            size={24}
            color={getRankColor(rank)}
          />
        ) : (
          <Text style={[
            styles.rankText,
            { color: getRankColor(rank) }
          ]}>
            {rank}
          </Text>
        )}
      </View>

      {/* Player Info */}
      <View style={styles.playerInfo}>
        <Text style={[
          styles.playerName,
          isCurrentPlayer && styles.currentPlayerName
        ]}>
          {entry.playerAlias || entry.playerName || 'Anonymous'}
        </Text>
        <Text style={styles.playerId}>
          {entry.playerId}
        </Text>
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={[
          styles.scoreText,
          isCurrentPlayer && styles.currentPlayerScore
        ]}>
          {formatScore(entry.score)}
        </Text>
        {entry.date && (
          <Text style={styles.dateText}>
            {formatDate(entry.date)}
          </Text>
        )}
      </View>

      {/* Current Player Indicator */}
      {isCurrentPlayer && (
        <View style={styles.currentPlayerIndicator}>
          <Ionicons name="person" size={16} color="#4A90E2" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentPlayerContainer: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentPlayerName: {
    color: '#4A90E2',
  },
  playerId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentPlayerScore: {
    color: '#4A90E2',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  currentPlayerIndicator: {
    marginLeft: 8,
  },
});

export default LeaderboardEntry;
