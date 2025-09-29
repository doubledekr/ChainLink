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
 * WeeklyLeaderboard - Shows weekly scores (resets every Monday)
 */
const WeeklyLeaderboard = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playerRank, setPlayerRank] = useState(null);
  const [weekInfo, setWeekInfo] = useState(null);

  useEffect(() => {
    loadWeeklyLeaderboard();
  }, []);

  /**
   * Load weekly leaderboard data
   */
  const loadWeeklyLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get weekly leaderboard
      const entries = await LeaderboardService.getLeaderboard('weeklyScore', {
        timeScope: 1, // This week
        playerScope: 0 // Global
      });
      
      setLeaderboardData(entries);
      
      // Get player's weekly rank
      const playerScore = await LeaderboardService.getPlayerScore('weeklyScore');
      if (playerScore) {
        setPlayerRank(playerScore);
      }
      
      // Set week information
      setWeekInfo(getWeekInfo());
      
    } catch (error) {
      console.error('Failed to load weekly leaderboard:', error);
      Alert.alert('Error', 'Failed to load weekly leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWeeklyLeaderboard();
    setRefreshing(false);
  };

  /**
   * Show Game Center/Google Play weekly leaderboard
   */
  const showNativeWeeklyLeaderboard = async () => {
    try {
      await LeaderboardService.showLeaderboard('weeklyScore');
    } catch (error) {
      console.error('Failed to show native weekly leaderboard:', error);
      Alert.alert('Error', 'Failed to open weekly leaderboard');
    }
  };

  /**
   * Get current week information
   */
  const getWeekInfo = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const daysUntilReset = Math.ceil((endOfWeek - now) / (1000 * 60 * 60 * 24));

    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      daysUntilReset: Math.max(0, daysUntilReset)
    };
  };

  /**
   * Format date
   */
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
        <Text style={styles.playerRankTitle}>Your Weekly Rank</Text>
        <View style={styles.playerRankCard}>
          <Text style={styles.playerRankText}>#{playerRank.rank}</Text>
          <Text style={styles.playerScoreText}>{playerRank.score.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  /**
   * Render week info section
   */
  const renderWeekInfo = () => {
    if (!weekInfo) return null;

    return (
      <View style={styles.weekInfoContainer}>
        <View style={styles.weekInfoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.weekInfoText}>
            Week of {formatDate(weekInfo.startDate)} - {formatDate(weekInfo.endDate)}
          </Text>
        </View>
        <View style={styles.weekInfoRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.weekInfoText}>
            Resets in {weekInfo.daysUntilReset} day{weekInfo.daysUntilReset !== 1 ? 's' : ''}
          </Text>
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
      <Text style={styles.emptyTitle}>No Weekly Scores Yet</Text>
      <Text style={styles.emptySubtitle}>
        Play games this week to see your score on the weekly leaderboard!
      </Text>
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.loadingText}>Loading weekly leaderboard...</Text>
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
        <Text style={styles.title}>Weekly Leaderboard</Text>
        <TouchableOpacity
          style={styles.nativeButton}
          onPress={showNativeWeeklyLeaderboard}
        >
          <Ionicons name="game-controller" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Week Info Section */}
      {renderWeekInfo()}

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
  weekInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  weekInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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

export default WeeklyLeaderboard;
