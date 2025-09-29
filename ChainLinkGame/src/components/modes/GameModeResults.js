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
import GameModeService from '../../services/GameModeService';

const { width, height } = Dimensions.get('window');

/**
 * GameModeResults - Component for displaying game mode results and statistics
 */
const GameModeResults = ({ 
  gameData, 
  modeConfig, 
  onPlayAgain, 
  onBackToModes, 
  onMainMenu,
  style 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();

    // Load additional data
    loadAdditionalData();
  }, []);

  /**
   * Load additional data (leaderboards, achievements)
   */
  const loadAdditionalData = async () => {
    try {
      setIsLoading(true);
      
      // Load leaderboard data
      if (modeConfig.leaderboardEnabled) {
        const leaderboard = await GameModeService.getLeaderboard(modeConfig.id);
        setLeaderboardData(leaderboard);
      }
      
      // Load achievements
      const newAchievements = await GameModeService.checkAchievements(modeConfig.id, gameData);
      setAchievements(newAchievements);
      
    } catch (error) {
      console.error('Failed to load additional data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get performance rating
   */
  const getPerformanceRating = () => {
    if (!gameData) return 'Good';
    
    const score = gameData.finalScore || 0;
    const time = gameData.timePlayed || 0;
    const accuracy = gameData.accuracy || 0;
    
    // Calculate rating based on mode
    switch (modeConfig.id) {
      case 'BLITZ':
        if (score >= 1000) return 'Excellent';
        if (score >= 750) return 'Great';
        if (score >= 500) return 'Good';
        return 'Keep Trying';
      
      case 'ZEN':
        if (accuracy >= 90) return 'Excellent';
        if (accuracy >= 80) return 'Great';
        if (accuracy >= 70) return 'Good';
        return 'Keep Learning';
      
      case 'SURVIVAL':
        if (gameData.finalLevel >= 10) return 'Excellent';
        if (gameData.finalLevel >= 7) return 'Great';
        if (gameData.finalLevel >= 4) return 'Good';
        return 'Keep Surviving';
      
      case 'TOURNAMENT':
        if (gameData.isChampion) return 'Champion!';
        if (gameData.wins >= 3) return 'Great';
        if (gameData.wins >= 2) return 'Good';
        return 'Keep Competing';
      
      case 'PRACTICE':
        if (accuracy >= 85) return 'Excellent';
        if (accuracy >= 75) return 'Great';
        if (accuracy >= 65) return 'Good';
        return 'Keep Practicing';
      
      default:
        return 'Good';
    }
  };

  /**
   * Get performance color
   */
  const getPerformanceColor = (rating) => {
    switch (rating) {
      case 'Excellent': return '#4CAF50';
      case 'Great': return '#2196F3';
      case 'Good': return '#FF9800';
      case 'Champion!': return '#FFD700';
      default: return '#666';
    }
  };

  /**
   * Format time
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Render main stats
   */
  const renderMainStats = () => {
    if (!gameData) return null;

    return (
      <View style={styles.mainStatsContainer}>
        <View style={styles.performanceContainer}>
          <Text style={styles.performanceLabel}>Performance</Text>
          <Text style={[
            styles.performanceRating,
            { color: getPerformanceColor(getPerformanceRating()) }
          ]}>
            {getPerformanceRating()}
          </Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {gameData.finalScore?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.statLabel}>Final Score</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {gameData.puzzlesCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Puzzles</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatTime(gameData.timePlayed || 0)}
            </Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          
          {gameData.accuracy && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {gameData.accuracy}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  /**
   * Render mode-specific stats
   */
  const renderModeSpecificStats = () => {
    if (!gameData) return null;

    switch (modeConfig.id) {
      case 'BLITZ':
        return (
          <View style={styles.modeStatsContainer}>
            <Text style={styles.modeStatsTitle}>Blitz Mode Stats</Text>
            <View style={styles.modeStatsGrid}>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.bestStreak || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Best Streak</Text>
              </View>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.puzzlesPerMinute || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Puzzles/Min</Text>
              </View>
            </View>
          </View>
        );
      
      case 'ZEN':
        return (
          <View style={styles.modeStatsContainer}>
            <Text style={styles.modeStatsTitle}>Zen Mode Stats</Text>
            <View style={styles.modeStatsGrid}>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.learningProgress || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Learning Points</Text>
              </View>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.hintsUsed || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Hints Used</Text>
              </View>
            </View>
          </View>
        );
      
      case 'SURVIVAL':
        return (
          <View style={styles.modeStatsContainer}>
            <Text style={styles.modeStatsTitle}>Survival Mode Stats</Text>
            <View style={styles.modeStatsGrid}>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.finalLevel || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Level Reached</Text>
              </View>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.bestStreak || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Best Streak</Text>
              </View>
            </View>
          </View>
        );
      
      case 'TOURNAMENT':
        return (
          <View style={styles.modeStatsContainer}>
            <Text style={styles.modeStatsTitle}>Tournament Stats</Text>
            <View style={styles.modeStatsGrid}>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.wins || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Wins</Text>
              </View>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.losses || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Losses</Text>
              </View>
            </View>
          </View>
        );
      
      case 'PRACTICE':
        return (
          <View style={styles.modeStatsContainer}>
            <Text style={styles.modeStatsTitle}>Practice Stats</Text>
            <View style={styles.modeStatsGrid}>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.learningProgress || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Learning Points</Text>
              </View>
              <View style={styles.modeStatItem}>
                <Text style={styles.modeStatValue}>
                  {gameData.mistakes || 0}
                </Text>
                <Text style={styles.modeStatLabel}>Mistakes</Text>
              </View>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  /**
   * Render achievements
   */
  const renderAchievements = () => {
    if (!achievements || achievements.length === 0) return null;

    return (
      <View style={styles.achievementsContainer}>
        <Text style={styles.achievementsTitle}>New Achievements!</Text>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render leaderboard
   */
  const renderLeaderboard = () => {
    if (!leaderboardData || !modeConfig.leaderboardEnabled) return null;

    return (
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
          {leaderboardData.slice(0, 10).map((entry, index) => (
            <View key={index} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>#{index + 1}</Text>
              <Text style={styles.leaderboardName}>{entry.playerName}</Text>
              <Text style={styles.leaderboardScore}>{entry.score.toLocaleString()}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  /**
   * Render action buttons
   */
  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.playAgainButton]}
          onPress={onPlayAgain}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.modesButton]}
          onPress={onBackToModes}
          activeOpacity={0.7}
        >
          <Ionicons name="game-controller" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Game Modes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.menuButton]}
          onPress={onMainMenu}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Main Menu</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        style, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Ionicons 
            name={getModeIcon(modeConfig.id)} 
            size={32} 
            color={modeConfig.color || '#4A90E2'} 
          />
          <Text style={styles.headerTitle}>{modeConfig.name} Results</Text>
        </View>
        
        {renderMainStats()}
        {renderModeSpecificStats()}
        {renderAchievements()}
        {renderLeaderboard()}
        {renderActionButtons()}
      </ScrollView>
    </Animated.View>
  );
};

/**
 * Get mode icon
 */
const getModeIcon = (modeId) => {
  switch (modeId) {
    case 'SINGLE': return 'game-controller';
    case 'BLITZ': return 'flash';
    case 'ZEN': return 'leaf';
    case 'SURVIVAL': return 'heart';
    case 'TOURNAMENT': return 'trophy';
    case 'PRACTICE': return 'school';
    default: return 'help-circle';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  mainStatsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  performanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  performanceRating: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  modeStatsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  modeStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modeStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeStatItem: {
    alignItems: 'center',
  },
  modeStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  modeStatLabel: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#ccc',
  },
  leaderboardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  leaderboardList: {
    maxHeight: 200,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  leaderboardRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    width: 40,
  },
  leaderboardName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
  leaderboardScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  modesButton: {
    backgroundColor: '#2196F3',
  },
  menuButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

export default GameModeResults;
