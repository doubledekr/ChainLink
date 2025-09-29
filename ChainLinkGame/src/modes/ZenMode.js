import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameModeService from '../services/GameModeService';

/**
 * ZenMode - Relaxed, untimed gameplay for learning
 */
class ZenMode {
  constructor() {
    this.modeId = 'ZEN';
    this.config = GameModeService.getGameMode(this.modeId);
    this.gameState = {
      puzzlesCompleted: 0,
      score: 0,
      hintsUsed: 0,
      learningProgress: 0,
      currentDifficulty: 'easy',
      streak: 0,
      isActive: false,
      startTime: null,
      adaptiveDifficulty: {
        correctAnswers: 0,
        totalAnswers: 0,
        difficultyLevel: 1
      }
    };
  }

  /**
   * Initialize zen mode
   */
  async initialize() {
    try {
      this.gameState.startTime = Date.now();
      this.gameState.isActive = true;
      
      console.log('Zen mode initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize zen mode:', error);
      return false;
    }
  }

  /**
   * Handle puzzle completion
   */
  handlePuzzleComplete(puzzleData) {
    if (!this.gameState.isActive) return;

    this.gameState.puzzlesCompleted += 1;
    this.gameState.streak += 1;
    this.gameState.adaptiveDifficulty.correctAnswers += 1;
    this.gameState.adaptiveDifficulty.totalAnswers += 1;

    // Calculate learning-focused score (lower emphasis on speed/time)
    const baseScore = puzzleData.baseScore || 50;
    const learningBonus = this.calculateLearningBonus(puzzleData);
    const progressBonus = this.calculateProgressBonus();
    
    const puzzleScore = Math.round(baseScore + learningBonus + progressBonus);
    this.gameState.score += puzzleScore;
    this.gameState.learningProgress += puzzleScore;

    // Update adaptive difficulty
    this.updateAdaptiveDifficulty();

    console.log(`Puzzle completed: +${puzzleScore} points (Learning progress: ${this.gameState.learningProgress})`);
  }

  /**
   * Handle puzzle failure
   */
  handlePuzzleFailure() {
    if (!this.gameState.isActive) return;

    this.gameState.streak = 0;
    this.gameState.adaptiveDifficulty.totalAnswers += 1;

    // Update adaptive difficulty (don't increase difficulty on failure)
    this.updateAdaptiveDifficulty();

    console.log('Puzzle failed. No pressure - keep learning!');
  }

  /**
   * Use a hint
   */
  useHint() {
    if (!this.gameState.isActive) return true; // Always allow hints in zen mode

    this.gameState.hintsUsed += 1;
    console.log(`Hint used. Total hints: ${this.gameState.hintsUsed}`);
    return true;
  }

  /**
   * Calculate learning bonus
   */
  calculateLearningBonus(puzzleData) {
    let bonus = 0;
    
    // Bonus for using different word patterns
    if (puzzleData.wordPattern && puzzleData.wordPattern !== 'common') {
      bonus += 25;
    }
    
    // Bonus for longer words
    if (puzzleData.wordLength >= 6) {
      bonus += 15;
    }
    
    // Bonus for using hints (encouraging learning)
    if (puzzleData.hintsUsed > 0) {
      bonus += puzzleData.hintsUsed * 10;
    }
    
    return bonus;
  }

  /**
   * Calculate progress bonus
   */
  calculateProgressBonus() {
    // Bonus based on overall learning progress
    const progressLevel = Math.floor(this.gameState.learningProgress / 1000);
    return progressLevel * 10;
  }

  /**
   * Update adaptive difficulty
   */
  updateAdaptiveDifficulty() {
    const accuracy = this.gameState.adaptiveDifficulty.correctAnswers / 
                     this.gameState.adaptiveDifficulty.totalAnswers;
    
    if (accuracy >= 0.8 && this.gameState.adaptiveDifficulty.difficultyLevel < 5) {
      // Increase difficulty if doing well
      this.gameState.adaptiveDifficulty.difficultyLevel += 1;
      this.gameState.currentDifficulty = this.getDifficultyFromLevel(
        this.gameState.adaptiveDifficulty.difficultyLevel
      );
      console.log(`Difficulty increased to: ${this.gameState.currentDifficulty}`);
    } else if (accuracy < 0.5 && this.gameState.adaptiveDifficulty.difficultyLevel > 1) {
      // Decrease difficulty if struggling
      this.gameState.adaptiveDifficulty.difficultyLevel -= 1;
      this.gameState.currentDifficulty = this.getDifficultyFromLevel(
        this.gameState.adaptiveDifficulty.difficultyLevel
      );
      console.log(`Difficulty decreased to: ${this.gameState.currentDifficulty}`);
    }
  }

  /**
   * Get difficulty from level
   */
  getDifficultyFromLevel(level) {
    switch (level) {
      case 1: return 'easy';
      case 2: return 'easy';
      case 3: return 'normal';
      case 4: return 'normal';
      case 5: return 'hard';
      default: return 'normal';
    }
  }

  /**
   * Get learning insights
   */
  getLearningInsights() {
    const accuracy = this.gameState.adaptiveDifficulty.totalAnswers > 0 
      ? (this.gameState.adaptiveDifficulty.correctAnswers / this.gameState.adaptiveDifficulty.totalAnswers) * 100
      : 0;
    
    const averageScore = this.gameState.puzzlesCompleted > 0 
      ? Math.round(this.gameState.score / this.gameState.puzzlesCompleted)
      : 0;

    return {
      accuracy: Math.round(accuracy),
      averageScore,
      learningProgress: this.gameState.learningProgress,
      currentDifficulty: this.gameState.currentDifficulty,
      hintsUsed: this.gameState.hintsUsed,
      puzzlesCompleted: this.gameState.puzzlesCompleted
    };
  }

  /**
   * End the game
   */
  async endGame() {
    if (!this.gameState.isActive) return;

    this.gameState.isActive = false;
    const timePlayed = Date.now() - this.gameState.startTime;
    const insights = this.getLearningInsights();

    const gameData = {
      finalScore: this.gameState.score,
      puzzlesCompleted: this.gameState.puzzlesCompleted,
      timePlayed: Math.round(timePlayed / 1000),
      learningProgress: this.gameState.learningProgress,
      hintsUsed: this.gameState.hintsUsed,
      accuracy: insights.accuracy,
      averageScore: insights.averageScore,
      finalDifficulty: this.gameState.currentDifficulty,
      modeId: this.modeId
    };

    // Save results
    await GameModeService.saveGameResults(gameData);
    await GameModeService.updateModeStats(this.modeId, gameData);

    console.log('Zen mode completed:', gameData);
    return gameData;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get UI components for zen mode
   */
  getUIComponents() {
    return {
      ProgressDisplay: this.ProgressDisplay,
      LearningInsights: this.LearningInsights,
      DifficultyDisplay: this.DifficultyDisplay,
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
        <Ionicons name="leaf" size={20} color="#4CAF50" />
        <Text style={styles.progressText}>
          {progress.toLocaleString()} Learning Points
        </Text>
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
          <Text style={styles.insightLabel}>Accuracy</Text>
          <Text style={styles.insightValue}>{insights.accuracy}%</Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Puzzles</Text>
          <Text style={styles.insightValue}>{insights.puzzlesCompleted}</Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightLabel}>Hints</Text>
          <Text style={styles.insightValue}>{insights.hintsUsed}</Text>
        </View>
      </View>
    );
  };

  /**
   * Difficulty display component
   */
  DifficultyDisplay = ({ style }) => {
    const [difficulty, setDifficulty] = useState(this.gameState.currentDifficulty);

    useEffect(() => {
      const interval = setInterval(() => {
        setDifficulty(this.gameState.currentDifficulty);
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    const getDifficultyColor = () => {
      switch (difficulty) {
        case 'easy': return '#4CAF50';
        case 'normal': return '#2196F3';
        case 'hard': return '#FF9800';
        default: return '#666';
      }
    };

    return (
      <View style={[styles.difficultyContainer, style]}>
        <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
          {difficulty.toUpperCase()}
        </Text>
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
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
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
  difficultyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
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

export default ZenMode;
