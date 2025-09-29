import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameModeService from '../services/GameModeService';

/**
 * PracticeMode - Learning-focused gameplay with hints and feedback
 */
class PracticeMode {
  constructor() {
    this.modeId = 'PRACTICE';
    this.config = GameModeService.getGameMode(this.modeId);
    this.gameState = {
      score: 0,
      puzzlesCompleted: 0,
      hintsUsed: 0,
      mistakes: 0,
      learningProgress: 0,
      currentTopic: 'general',
      topicProgress: {},
      isActive: false,
      startTime: null,
      sessionData: {
        topics: ['general', 'animals', 'food', 'colors', 'nature'],
        currentTopicIndex: 0,
        topicScores: {},
        learningInsights: []
      },
      feedback: {
        lastPuzzle: null,
        suggestions: [],
        strengths: [],
        weaknesses: []
      }
    };
  }

  /**
   * Initialize practice mode
   */
  async initialize(topic = 'general') {
    try {
      this.gameState.startTime = Date.now();
      this.gameState.isActive = true;
      this.gameState.currentTopic = topic;
      
      // Initialize topic progress
      if (!this.gameState.topicProgress[topic]) {
        this.gameState.topicProgress[topic] = {
          puzzlesCompleted: 0,
          averageScore: 0,
          hintsUsed: 0,
          mistakes: 0,
          learningLevel: 1
        };
      }
      
      console.log(`Practice mode initialized for topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize practice mode:', error);
      return false;
    }
  }

  /**
   * Handle puzzle completion
   */
  handlePuzzleComplete(puzzleData) {
    if (!this.gameState.isActive) return;

    this.gameState.puzzlesCompleted += 1;
    this.gameState.sessionData.topicScores[this.gameState.currentTopic] = 
      (this.gameState.sessionData.topicScores[this.gameState.currentTopic] || 0) + 1;

    // Calculate learning-focused score
    const baseScore = puzzleData.baseScore || 50;
    const topicBonus = this.calculateTopicBonus(puzzleData);
    const learningBonus = this.calculateLearningBonus(puzzleData);
    const progressBonus = this.calculateProgressBonus();
    
    const puzzleScore = Math.round(baseScore + topicBonus + learningBonus + progressBonus);
    this.gameState.score += puzzleScore;
    this.gameState.learningProgress += puzzleScore;

    // Update topic progress
    this.updateTopicProgress(puzzleScore, puzzleData);

    // Generate feedback
    this.generateFeedback(puzzleData, true);

    console.log(`Puzzle completed: +${puzzleScore} points (Topic: ${this.gameState.currentTopic})`);
  }

  /**
   * Handle puzzle failure
   */
  handlePuzzleFailure(puzzleData) {
    if (!this.gameState.isActive) return;

    this.gameState.mistakes += 1;
    this.gameState.sessionData.topicScores[this.gameState.currentTopic] = 
      (this.gameState.sessionData.topicScores[this.gameState.currentTopic] || 0) - 0.5;

    // Update topic progress
    this.updateTopicProgress(0, puzzleData);

    // Generate feedback
    this.generateFeedback(puzzleData, false);

    console.log(`Puzzle failed. Learning opportunity!`);
  }

  /**
   * Calculate topic bonus
   */
  calculateTopicBonus(puzzleData) {
    if (puzzleData.topic === this.gameState.currentTopic) {
      return 25;
    }
    return 0;
  }

  /**
   * Calculate learning bonus
   */
  calculateLearningBonus(puzzleData) {
    let bonus = 0;
    
    // Bonus for using hints (encouraging learning)
    if (puzzleData.hintsUsed > 0) {
      bonus += puzzleData.hintsUsed * 15;
    }
    
    // Bonus for longer words
    if (puzzleData.wordLength >= 6) {
      bonus += 20;
    }
    
    // Bonus for different word patterns
    if (puzzleData.wordPattern && puzzleData.wordPattern !== 'common') {
      bonus += 15;
    }
    
    return bonus;
  }

  /**
   * Calculate progress bonus
   */
  calculateProgressBonus() {
    const topicProgress = this.gameState.topicProgress[this.gameState.currentTopic];
    if (topicProgress) {
      return Math.min(topicProgress.learningLevel * 10, 50);
    }
    return 0;
  }

  /**
   * Update topic progress
   */
  updateTopicProgress(score, puzzleData) {
    const topic = this.gameState.currentTopic;
    const progress = this.gameState.topicProgress[topic];
    
    if (progress) {
      progress.puzzlesCompleted += 1;
      progress.averageScore = (progress.averageScore * (progress.puzzlesCompleted - 1) + score) / progress.puzzlesCompleted;
      progress.hintsUsed += puzzleData.hintsUsed || 0;
      progress.mistakes += puzzleData.failed ? 1 : 0;
      
      // Update learning level based on performance
      if (progress.averageScore > 80 && progress.puzzlesCompleted >= 5) {
        progress.learningLevel = Math.min(progress.learningLevel + 1, 5);
      }
    }
  }

  /**
   * Generate feedback for learning
   */
  generateFeedback(puzzleData, isSuccess) {
    const feedback = {
      lastPuzzle: {
        topic: puzzleData.topic || this.gameState.currentTopic,
        word: puzzleData.word,
        score: puzzleData.baseScore || 0,
        hintsUsed: puzzleData.hintsUsed || 0,
        isSuccess: isSuccess,
        timestamp: Date.now()
      },
      suggestions: [],
      strengths: [],
      weaknesses: []
    };

    // Generate suggestions based on performance
    if (isSuccess) {
      if (puzzleData.hintsUsed === 0) {
        feedback.strengths.push('Great job solving without hints!');
      }
      if (puzzleData.wordLength >= 6) {
        feedback.strengths.push('Excellent work with longer words!');
      }
    } else {
      feedback.suggestions.push('Try breaking the word into smaller parts');
      feedback.suggestions.push('Use hints to learn new patterns');
      feedback.weaknesses.push('Word pattern recognition');
    }

    // Topic-specific feedback
    if (puzzleData.topic === 'animals') {
      feedback.suggestions.push('Think about animal characteristics');
    } else if (puzzleData.topic === 'food') {
      feedback.suggestions.push('Consider cooking methods or ingredients');
    }

    this.gameState.feedback = feedback;
  }

  /**
   * Use a hint
   */
  useHint() {
    if (!this.gameState.isActive) return true; // Always allow hints in practice mode

    this.gameState.hintsUsed += 1;
    console.log(`Hint used. Total hints: ${this.gameState.hintsUsed}`);
    return true;
  }

  /**
   * Switch to next topic
   */
  switchToNextTopic() {
    const currentIndex = this.gameState.sessionData.currentTopicIndex;
    const nextIndex = (currentIndex + 1) % this.gameState.sessionData.topics.length;
    
    this.gameState.sessionData.currentTopicIndex = nextIndex;
    this.gameState.currentTopic = this.gameState.sessionData.topics[nextIndex];
    
    console.log(`Switched to topic: ${this.gameState.currentTopic}`);
  }

  /**
   * Get learning insights
   */
  getLearningInsights() {
    const insights = {
      overallProgress: this.gameState.learningProgress,
      puzzlesCompleted: this.gameState.puzzlesCompleted,
      hintsUsed: this.gameState.hintsUsed,
      mistakes: this.gameState.mistakes,
      currentTopic: this.gameState.currentTopic,
      topicProgress: this.gameState.topicProgress,
      strengths: this.gameState.feedback.strengths,
      weaknesses: this.gameState.feedback.weaknesses,
      suggestions: this.gameState.feedback.suggestions
    };

    return insights;
  }

  /**
   * Get topic recommendations
   */
  getTopicRecommendations() {
    const recommendations = [];
    const topics = Object.keys(this.gameState.topicProgress);
    
    topics.forEach(topic => {
      const progress = this.gameState.topicProgress[topic];
      if (progress) {
        if (progress.learningLevel < 3) {
          recommendations.push({
            topic: topic,
            reason: 'Needs more practice',
            priority: 'high'
          });
        } else if (progress.learningLevel >= 4) {
          recommendations.push({
            topic: topic,
            reason: 'Ready for advanced challenges',
            priority: 'low'
          });
        }
      }
    });
    
    return recommendations;
  }

  /**
   * End practice session
   */
  async endSession() {
    if (!this.gameState.isActive) return;

    this.gameState.isActive = false;
    const sessionTime = (Date.now() - this.gameState.startTime) / 1000;
    const insights = this.getLearningInsights();

    const sessionData = {
      finalScore: this.gameState.score,
      puzzlesCompleted: this.gameState.puzzlesCompleted,
      sessionTime: Math.round(sessionTime),
      learningProgress: this.gameState.learningProgress,
      hintsUsed: this.gameState.hintsUsed,
      mistakes: this.gameState.mistakes,
      topicProgress: this.gameState.topicProgress,
      insights: insights,
      modeId: this.modeId
    };

    // Save results
    await GameModeService.saveGameResults(sessionData);
    await GameModeService.updateModeStats(this.modeId, sessionData);

    console.log('Practice session completed:', sessionData);
    return sessionData;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get UI components for practice mode
   */
  getUIComponents() {
    return {
      ProgressDisplay: this.ProgressDisplay,
      TopicDisplay: this.TopicDisplay,
      LearningInsights: this.LearningInsights,
      FeedbackDisplay: this.FeedbackDisplay,
      HintButton: this.HintButton
    };
  }

  /**
   * Progress display component
   */
  ProgressDisplay = ({ style }) => {
    const [progress, setProgress] = useState(this.gameState.learningProgress);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress(this.gameState.learningProgress);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.progressContainer, style]}>
        <Ionicons name="school" size={20} color="#2196F3" />
        <Text style={styles.progressText}>
          {progress.toLocaleString()} Learning Points
        </Text>
      </View>
    );
  };

  /**
   * Topic display component
   */
  TopicDisplay = ({ style }) => {
    const [topic, setTopic] = useState(this.gameState.currentTopic);

    useEffect(() => {
      const interval = setInterval(() => {
        setTopic(this.gameState.currentTopic);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.topicContainer, style]}>
        <Text style={styles.topicLabel}>TOPIC</Text>
        <Text style={styles.topicValue}>{topic.toUpperCase()}</Text>
      </View>
    );
  };

  /**
   * Learning insights component
   */
  LearningInsights = ({ style }) => {
    const [insights, setInsights] = useState(this.getLearningInsights());

    useEffect(() => {
      const interval = setInterval(() => {
        setInsights(this.getLearningInsights());
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.insightsContainer, style]}>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Puzzles</Text>
          <Text style={styles.insightValue}>{insights.puzzlesCompleted}</Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Hints</Text>
          <Text style={styles.insightValue}>{insights.hintsUsed}</Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Mistakes</Text>
          <Text style={styles.insightValue}>{insights.mistakes}</Text>
        </View>
      </View>
    );
  };

  /**
   * Feedback display component
   */
  FeedbackDisplay = ({ style }) => {
    const [feedback, setFeedback] = useState(this.gameState.feedback);

    useEffect(() => {
      const interval = setInterval(() => {
        setFeedback(this.gameState.feedback);
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    if (!feedback.lastPuzzle) return null;

    return (
      <View style={[styles.feedbackContainer, style]}>
        <Text style={styles.feedbackLabel}>Last Puzzle</Text>
        <Text style={styles.feedbackText}>
          {feedback.lastPuzzle.word} - {feedback.lastPuzzle.isSuccess ? '✓' : '✗'}
        </Text>
        {feedback.suggestions.length > 0 && (
          <Text style={styles.suggestionText}>
            💡 {feedback.suggestions[0]}
          </Text>
        )}
      </View>
    );
  };

  /**
   * Hint button component
   */
  HintButton = ({ onPress, style }) => {
    return (
      <View style={[styles.hintButtonContainer, style]}>
        <Text style={styles.hintButtonText}>
          💡 Hint Available
        </Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  topicContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  topicLabel: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: 'bold',
  },
  topicValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  insightsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  insightItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  insightLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedbackContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  feedbackLabel: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: 'bold',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 2,
  },
  suggestionText: {
    fontSize: 12,
    color: '#FFD700',
    fontStyle: 'italic',
  },
  hintButtonContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default PracticeMode;
