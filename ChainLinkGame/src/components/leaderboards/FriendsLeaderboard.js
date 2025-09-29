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
 * FriendsLeaderboard - Shows friends' scores only
 */
const FriendsLeaderboard = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playerRank, setPlayerRank] = useState(null);

  useEffect(() => {
    loadFriendsLeaderboard();
  }, []);

  /**
   * Load friends leaderboard data
   */
  const loadFriendsLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get friends leaderboard
      const entries = await LeaderboardService.getLeaderboard('highScore', {
        timeScope: 0, // All time
        playerScope: 1 // Friends only
      });
      
      setLeaderboardData(entries);
      
      // Get player's rank among friends
      const playerScore = await LeaderboardService.getPlayerScore('highScore');
      if (playerScore) {
        setPlayerRank(playerScore);
      }
      
    } catch (error) {
      console.error('Failed to load friends leaderboard:', error);
      Alert.alert('Error', 'Failed to load friends leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFriendsLeaderboard();
    setRefreshing(false);
  };

  /**
   * Show Game Center/Google Play friends leaderboard
   */
  const showNativeFriendsLeaderboard = async () => {
    try {
      await LeaderboardService.showLeaderboard('highScore');
    } catch (error) {
      console.error('Failed to show native friends leaderboard:', error);
      Alert.alert('Error', 'Failed to open friends leaderboard');
    }
  };

  /**
   * Add friends (placeholder for future implementation)
   */
  const addFriends = () => {
    Alert.alert(
      'Add Friends',
      'Connect with friends through Game Center or Google Play Games to see their scores!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: showNativeFriendsLeaderboard }
      ]
    );
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
        <Text style={styles.playerRankTitle}>Your Rank Among Friends</Text>
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
      <Ionicons name="people-outline" size={64} color="#666" />
      <Text style={styles.emptyTitle}>No Friends Yet</Text>
      <Text style={styles.emptySubtitle}>
        Connect with friends through Game Center or Google Play Games to compete!
      </Text>
      <TouchableOpacity style={styles.addFriendsButton} onPress={addFriends}>
        <Text style={styles.addFriendsButtonText}>Add Friends</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.loadingText}>Loading friends leaderboard...</Text>
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
        <Text style={styles.title}>Friends Leaderboard</Text>
        <TouchableOpacity
          style={styles.nativeButton}
          onPress={showNativeFriendsLeaderboard}
        >
          <Ionicons name="people" size={24} color="#4A90E2" />
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
    marginBottom: 24,
  },
  addFriendsButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendsLeaderboard;
