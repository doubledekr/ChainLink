import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeaderboardService from '../../services/LeaderboardService';
import LeaderboardEntry from './LeaderboardEntry';

/**
 * GlobalLeaderboard - Shows top 100 players worldwide
 */
const GlobalLeaderboard = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playerRank, setPlayerRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  /**
   * Load leaderboard data
   */
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get global leaderboard
      const entries = await LeaderboardService.getLeaderboard('highScore', {
        timeScope: 0, // All time
        playerScope: 0 // Global
      });
      
      setLeaderboardData(entries);
      
      // Get player's rank
      const playerScore = await LeaderboardService.getPlayerScore('highScore');
      if (playerScore) {
        setPlayerRank(playerScore);
      }
      
    } catch (error) {
      console.error('Failed to load global leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  /**
   * Show Game Center/Google Play leaderboard
   */
  const showNativeLeaderboard = async () => {
    try {
      await LeaderboardService.showLeaderboard('highScore');
    } catch (error) {
      console.error('Failed to show native leaderboard:', error);
      Alert.alert('Error', 'Failed to open leaderboard');
    }
  };

  /**
   * Render leaderboard entry
   */
  const renderLeaderboardEntry = ({ item, index }) => (
    <LeaderboardEntry
      entry={item}
      rank={index + 1}
      isCurrentPlayer={item.isCurrentPlayer}
    />
  );

  /**
   * Render player's rank section
   */
  const renderPlayerRank = () => {
    if (!playerRank) return null;

    return (
      <View style={styles.playerRankContainer}>
        <Text style={styles.playerRankTitle}>Your Rank</Text>
        <View style={styles.playerRankCard}>
          <Text style={styles.playerRankText}>#{playerRank.rank}</Text>
          <Text style={styles.playerScoreText}>{playerRank.score.toLocaleString()}</Text>
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
      <Text style={styles.emptyTitle}>No Scores Yet</Text>
      <Text style={styles.emptySubtitle}>
        Play your first game to see your score on the leaderboard!
      </Text>
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.loadingText}>Loading leaderboard...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Global Leaderboard</Text>
        <TouchableOpacity
          style={styles.nativeButton}
          onPress={showNativeLeaderboard}
        >
          <Ionicons name="game-controller" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Player Rank Section */}
      {renderPlayerRank()}

      {/* Leaderboard Content */}
      {loading ? (
        renderLoading()
      ) : leaderboardData.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={leaderboardData}
          renderItem={renderLeaderboardEntry}
          keyExtractor={(item, index) => `${item.playerId}_${index}`}
          style={styles.leaderboardList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  nativeButton: {
    padding: 8,
  },
  playerRankContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  playerRankTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  playerRankCard: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerRankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerScoreText: {
    fontSize: 16,
    color: '#fff',
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
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
});

export default GlobalLeaderboard;
