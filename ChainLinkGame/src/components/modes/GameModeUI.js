import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

/**
 * GameModeUI - Unified UI component for displaying game mode information
 */
const GameModeUI = ({ 
  modeInstance, 
  modeConfig, 
  style,
  showProgress = true,
  showStats = true,
  showTime = true,
  showLives = false,
  showStreak = false,
  showScore = true,
  showHints = false,
  showDifficulty = false,
  showTopic = false,
  showRound = false,
  showBracket = false,
  showOpponent = false
}) => {
  const [gameState, setGameState] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (modeInstance) {
      // Start fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Update game state periodically
      const interval = setInterval(() => {
        if (modeInstance.getGameState) {
          setGameState(modeInstance.getGameState());
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [modeInstance]);

  if (!modeInstance || !modeConfig) {
    return null;
  }

  /**
   * Render progress display
   */
  const renderProgressDisplay = () => {
    if (!showProgress || !modeInstance.ProgressDisplay) return null;
    
    const ProgressComponent = modeInstance.ProgressDisplay;
    return (
      <View style={styles.progressContainer}>
        <ProgressComponent />
      </View>
    );
  };

  /**
   * Render stats display
   */
  const renderStatsDisplay = () => {
    if (!showStats || !modeInstance.LearningInsights) return null;
    
    const StatsComponent = modeInstance.LearningInsights;
    return (
      <View style={styles.statsContainer}>
        <StatsComponent />
      </View>
    );
  };

  /**
   * Render time display
   */
  const renderTimeDisplay = () => {
    if (!showTime || !modeInstance.TimeDisplay) return null;
    
    const TimeComponent = modeInstance.TimeDisplay;
    return (
      <View style={styles.timeContainer}>
        <TimeComponent />
      </View>
    );
  };

  /**
   * Render lives display
   */
  const renderLivesDisplay = () => {
    if (!showLives || !modeInstance.LivesDisplay) return null;
    
    const LivesComponent = modeInstance.LivesDisplay;
    return (
      <View style={styles.livesContainer}>
        <LivesComponent />
      </View>
    );
  };

  /**
   * Render streak display
   */
  const renderStreakDisplay = () => {
    if (!showStreak || !modeInstance.StreakDisplay) return null;
    
    const StreakComponent = modeInstance.StreakDisplay;
    return (
      <View style={styles.streakContainer}>
        <StreakComponent />
      </View>
    );
  };

  /**
   * Render score display
   */
  const renderScoreDisplay = () => {
    if (!showScore || !modeInstance.ScoreDisplay) return null;
    
    const ScoreComponent = modeInstance.ScoreDisplay;
    return (
      <View style={styles.scoreContainer}>
        <ScoreComponent />
      </View>
    );
  };

  /**
   * Render hints display
   */
  const renderHintsDisplay = () => {
    if (!showHints || !modeInstance.HintButton) return null;
    
    const HintsComponent = modeInstance.HintButton;
    return (
      <View style={styles.hintsContainer}>
        <HintsComponent />
      </View>
    );
  };

  /**
   * Render difficulty display
   */
  const renderDifficultyDisplay = () => {
    if (!showDifficulty || !modeInstance.DifficultyDisplay) return null;
    
    const DifficultyComponent = modeInstance.DifficultyDisplay;
    return (
      <View style={styles.difficultyContainer}>
        <DifficultyComponent />
      </View>
    );
  };

  /**
   * Render topic display
   */
  const renderTopicDisplay = () => {
    if (!showTopic || !modeInstance.TopicDisplay) return null;
    
    const TopicComponent = modeInstance.TopicDisplay;
    return (
      <View style={styles.topicContainer}>
        <TopicComponent />
      </View>
    );
  };

  /**
   * Render round display
   */
  const renderRoundDisplay = () => {
    if (!showRound || !modeInstance.RoundDisplay) return null;
    
    const RoundComponent = modeInstance.RoundDisplay;
    return (
      <View style={styles.roundContainer}>
        <RoundComponent />
      </View>
    );
  };

  /**
   * Render bracket display
   */
  const renderBracketDisplay = () => {
    if (!showBracket || !modeInstance.BracketDisplay) return null;
    
    const BracketComponent = modeInstance.BracketDisplay;
    return (
      <View style={styles.bracketContainer}>
        <BracketComponent />
      </View>
    );
  };

  /**
   * Render opponent display
   */
  const renderOpponentDisplay = () => {
    if (!showOpponent || !modeInstance.OpponentDisplay) return null;
    
    const OpponentComponent = modeInstance.OpponentDisplay;
    return (
      <View style={styles.opponentContainer}>
        <OpponentComponent />
      </View>
    );
  };

  /**
   * Render mode-specific UI elements
   */
  const renderModeSpecificUI = () => {
    switch (modeConfig.id) {
      case 'BLITZ':
        return (
          <View style={styles.modeSpecificContainer}>
            {renderTimeDisplay()}
            {renderStreakDisplay()}
            {renderScoreDisplay()}
          </View>
        );
      
      case 'ZEN':
        return (
          <View style={styles.modeSpecificContainer}>
            {renderProgressDisplay()}
            {renderStatsDisplay()}
            {renderDifficultyDisplay()}
            {renderHintsDisplay()}
          </View>
        );
      
      case 'SURVIVAL':
        return (
          <View style={styles.modeSpecificContainer}>
            {renderLivesDisplay()}
            {renderLevelDisplay()}
            {renderTimeDisplay()}
            {renderScoreDisplay()}
            {renderStreakDisplay()}
          </View>
        );
      
      case 'TOURNAMENT':
        return (
          <View style={styles.modeSpecificContainer}>
            {renderRoundDisplay()}
            {renderScoreDisplay()}
            {renderTimeDisplay()}
            {renderBracketDisplay()}
            {renderOpponentDisplay()}
          </View>
        );
      
      case 'PRACTICE':
        return (
          <View style={styles.modeSpecificContainer}>
            {renderProgressDisplay()}
            {renderTopicDisplay()}
            {renderStatsDisplay()}
            {renderFeedbackDisplay()}
            {renderHintsDisplay()}
          </View>
        );
      
      default:
        return (
          <View style={styles.modeSpecificContainer}>
            {renderScoreDisplay()}
            {renderTimeDisplay()}
          </View>
        );
    }
  };

  /**
   * Render level display (for survival mode)
   */
  const renderLevelDisplay = () => {
    if (!modeInstance.LevelDisplay) return null;
    
    const LevelComponent = modeInstance.LevelDisplay;
    return (
      <View style={styles.levelContainer}>
        <LevelComponent />
      </View>
    );
  };

  /**
   * Render feedback display (for practice mode)
   */
  const renderFeedbackDisplay = () => {
    if (!modeInstance.FeedbackDisplay) return null;
    
    const FeedbackComponent = modeInstance.FeedbackDisplay;
    return (
      <View style={styles.feedbackContainer}>
        <FeedbackComponent />
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <View style={styles.modeHeader}>
        <View style={styles.modeInfo}>
          <Ionicons 
            name={getModeIcon(modeConfig.id)} 
            size={24} 
            color={modeConfig.color || '#4A90E2'} 
          />
          <Text style={[styles.modeName, { color: modeConfig.color || '#4A90E2' }]}>
            {modeConfig.name}
          </Text>
        </View>
        
        {renderModeSpecificUI()}
      </View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 1000,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modeSpecificContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  progressContainer: {
    marginLeft: 8,
  },
  statsContainer: {
    marginLeft: 8,
  },
  timeContainer: {
    marginLeft: 8,
  },
  livesContainer: {
    marginLeft: 8,
  },
  streakContainer: {
    marginLeft: 8,
  },
  scoreContainer: {
    marginLeft: 8,
  },
  hintsContainer: {
    marginLeft: 8,
  },
  difficultyContainer: {
    marginLeft: 8,
  },
  topicContainer: {
    marginLeft: 8,
  },
  roundContainer: {
    marginLeft: 8,
  },
  bracketContainer: {
    marginLeft: 8,
  },
  opponentContainer: {
    marginLeft: 8,
  },
  levelContainer: {
    marginLeft: 8,
  },
  feedbackContainer: {
    marginLeft: 8,
  },
});

export default GameModeUI;
