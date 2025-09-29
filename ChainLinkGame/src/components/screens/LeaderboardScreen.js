import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLeaderboards } from '../../hooks/useLeaderboards';
import { useUserProfile } from '../../hooks/useUserProfile';

/**
 * LeaderboardScreen - Main leaderboard selection screen
 */
const LeaderboardScreen = ({ navigation }) => {
  const leaderboards = useLeaderboards();
  const userProfile = useUserProfile();

  /**
   * Navigate to specific leaderboard
   */
  const navigateToLeaderboard = (type) => {
    switch (type) {
      case 'global':
        navigation.navigate('GlobalLeaderboard');
        break;
      case 'friends':
        navigation.navigate('FriendsLeaderboard');
        break;
      case 'weekly':
        navigation.navigate('WeeklyLeaderboard');
        break;
      default:
        break;
    }
  };

  /**
   * Show native achievements
   */
  const showAchievements = async () => {
    try {
      await leaderboards.showAchievements();
    } catch (error) {
      console.error('Failed to show achievements:', error);
    }
  };

  /**
   * Render leaderboard option card
   */
  const renderLeaderboardCard = (type, title, description, icon, color) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={() => navigateToLeaderboard(type)}
      disabled={!leaderboards.isInitialized}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  /**
   * Render user stats section
   */
  const renderUserStats = () => {
    if (!userProfile.isInitialized) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.highScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>High Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.maxStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.gamesWon}</Text>
            <Text style={styles.statLabel}>Games Won</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render authentication status
   */
  const renderAuthStatus = () => {
    if (!leaderboards.isInitialized) {
      return (
        <View style={styles.authContainer}>
          <Ionicons name="warning" size={24} color="#FF6B6B" />
          <Text style={styles.authText}>
            Leaderboards not available. Please check your internet connection.
          </Text>
        </View>
      );
    }

    if (!leaderboards.isAuthenticated) {
      return (
        <View style={styles.authContainer}>
          <Ionicons name="person-add" size={24} color="#FFA726" />
          <Text style={styles.authText}>
            Sign in to Game Center or Google Play Games to access leaderboards.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.authContainer}>
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        <Text style={styles.authText}>
          Signed in as {leaderboards.playerName}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboards</Text>
        <TouchableOpacity
          style={styles.achievementsButton}
          onPress={showAchievements}
          disabled={!leaderboards.isInitialized}
        >
          <Ionicons name="trophy" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Authentication Status */}
        {renderAuthStatus()}

        {/* User Stats */}
        {renderUserStats()}

        {/* Leaderboard Options */}
        <View style={styles.leaderboardsContainer}>
          <Text style={styles.sectionTitle}>Leaderboards</Text>
          
          {renderLeaderboardCard(
            'global',
            'Global Leaderboard',
            'Top players worldwide',
            'globe',
            '#4A90E2'
          )}
          
          {renderLeaderboardCard(
            'friends',
            'Friends Leaderboard',
            'Compete with your friends',
            'people',
            '#FF6B6B'
          )}
          
          {renderLeaderboardCard(
            'weekly',
            'Weekly Leaderboard',
            'This week\'s top scores',
            'calendar',
            '#4CAF50'
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.achievementsAction]}
            onPress={showAchievements}
            disabled={!leaderboards.isInitialized}
          >
            <Ionicons name="trophy" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View Achievements</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  achievementsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  authContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  authText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
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
  leaderboardsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsContainer: {
    margin: 20,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  achievementsAction: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LeaderboardScreen;
