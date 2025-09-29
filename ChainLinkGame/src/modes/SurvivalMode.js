import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameModeService from '../services/GameModeService';

/**
 * SurvivalMode - Endless mode with increasing difficulty
 */
class SurvivalMode {
  constructor() {
    this.modeId = 'SURVIVAL';
    this.config = GameModeService.getGameMode(this.modeId);
    this.gameState = {
      score: 0,
      level: 1,
      lives: 3,
      maxLives: 3,
      streak: 0,
      bestStreak: 0,
      difficulty: 1,
      timeBonus: 0,
      survivalTime: 0,
      puzzlesCompleted: 0,
      isActive: false,
      startTime: null,
      levelStartTime: null,
      levelTimeLimit: 30, // 30 seconds per level
      difficultyRamp: {
        level: 1,
        timeLimit: 30,
        requiredScore: 100,
        livesLost: 0
      }
    };
  }

  /**
   * Initialize survival mode
   */
  async initialize() {
    try {
      this.gameState.startTime = Date.now();
      this.gameState.levelStartTime = Date.now();
      this.gameState.isActive = true;
      
      console.log('Survival mode initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize survival mode:', error);
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
    
    if (this.gameState.streak > this.gameState.bestStreak) {
      this.gameState.bestStreak = this.gameState.streak;
    }

    // Calculate score with survival bonuses
    const baseScore = puzzleData.baseScore || 50;
    const streakBonus = this.calculateStreakBonus();
    const timeBonus = this.calculateTimeBonus();
    const difficultyBonus = this.calculateDifficultyBonus();
    const survivalBonus = this.calculateSurvivalBonus();
    
    const puzzleScore = Math.round(baseScore + streakBonus + timeBonus + difficultyBonus + survivalBonus);
    this.gameState.score += puzzleScore;

    // Check if level completed
    if (this.gameState.score >= this.gameState.difficultyRamp.requiredScore) {
      this.completeLevel();
    }

    console.log(`Puzzle completed: +${puzzleScore} points (Level ${this.gameState.level}, Lives: ${this.gameState.lives})`);
  }

  /**
   * Handle puzzle failure
   */
  handlePuzzleFailure() {
    if (!this.gameState.isActive) return;

    this.gameState.streak = 0;
    this.gameState.lives -= 1;
    this.gameState.difficultyRamp.livesLost += 1;

    console.log(`Puzzle failed! Lives remaining: ${this.gameState.lives}`);

    // Check if game over
    if (this.gameState.lives <= 0) {
      this.endGame();
    }
  }

  /**
   * Complete current level
   */
  completeLevel() {
    this.gameState.level += 1;
    this.gameState.difficulty += 1;
    
    // Increase difficulty
    this.gameState.difficultyRamp.level = this.gameState.level;
    this.gameState.difficultyRamp.timeLimit = Math.max(15, 30 - (this.gameState.level * 2));
    this.gameState.difficultyRamp.requiredScore = 100 + (this.gameState.level * 50);
    
    // Reset level timer
    this.gameState.levelStartTime = Date.now();
    this.gameState.levelTimeLimit = this.gameState.difficultyRamp.timeLimit;

    console.log(`Level ${this.gameState.level} completed! New difficulty: ${this.gameState.difficulty}`);
  }

  /**
   * Calculate streak bonus
   */
  calculateStreakBonus() {
    if (this.gameState.streak <= 1) return 0;
    return Math.min(this.gameState.streak * 5, 100);
  }

  /**
   * Calculate time bonus
   */
  calculateTimeBonus() {
    const timeElapsed = (Date.now() - this.gameState.levelStartTime) / 1000;
    const timeRemaining = this.gameState.levelTimeLimit - timeElapsed;
    
    if (timeRemaining > 0) {
      return Math.round(timeRemaining * 2);
    }
    return 0;
  }

  /**
   * Calculate difficulty bonus
   */
  calculateDifficultyBonus() {
    return this.gameState.difficulty * 10;
  }

  /**
   * Calculate survival bonus
   */
  calculateSurvivalBonus() {
    const survivalTime = (Date.now() - this.gameState.startTime) / 1000;
    return Math.floor(survivalTime / 30) * 5; // 5 points per 30 seconds survived
  }

  /**
   * Use a hint
   */
  useHint() {
    if (!this.gameState.isActive) return false; // No hints in survival mode

    console.log('No hints available in survival mode');
    return false;
  }

  /**
   * Get survival stats
   */
  getSurvivalStats() {
    const survivalTime = (Date.now() - this.gameState.startTime) / 1000;
    const levelProgress = this.gameState.score / this.gameState.difficultyRamp.requiredScore;
    
    return {
      level: this.gameState.level,
      score: this.gameState.score,
      lives: this.gameState.lives,
      maxLives: this.gameState.maxLives,
      streak: this.gameState.streak,
      bestStreak: this.gameState.bestStreak,
      survivalTime: Math.round(survivalTime),
      levelProgress: Math.min(levelProgress, 1),
      timeRemaining: this.getTimeRemaining(),
      difficulty: this.gameState.difficulty
    };
  }

  /**
   * Get time remaining for current level
   */
  getTimeRemaining() {
    const timeElapsed = (Date.now() - this.gameState.levelStartTime) / 1000;
    return Math.max(0, this.gameState.levelTimeLimit - timeElapsed);
  }

  /**
   * Check if level time is up
   */
  checkLevelTime() {
    if (!this.gameState.isActive) return;

    const timeRemaining = this.getTimeRemaining();
    
    if (timeRemaining <= 0) {
      // Time's up - lose a life
      this.gameState.lives -= 1;
      this.gameState.streak = 0;
      this.gameState.difficultyRamp.livesLost += 1;

      console.log(`Time's up! Lives remaining: ${this.gameState.lives}`);

      // Check if game over
      if (this.gameState.lives <= 0) {
        this.endGame();
      } else {
        // Reset level timer
        this.gameState.levelStartTime = Date.now();
      }
    }
  }

  /**
   * End the game
   */
  async endGame() {
    if (!this.gameState.isActive) return;

    this.gameState.isActive = false;
    const survivalTime = (Date.now() - this.gameState.startTime) / 1000;
    const stats = this.getSurvivalStats();

    const gameData = {
      finalScore: this.gameState.score,
      finalLevel: this.gameState.level,
      survivalTime: Math.round(survivalTime),
      bestStreak: this.gameState.bestStreak,
      puzzlesCompleted: this.gameState.puzzlesCompleted,
      livesLost: this.gameState.difficultyRamp.livesLost,
      finalDifficulty: this.gameState.difficulty,
      modeId: this.modeId
    };

    // Save results
    await GameModeService.saveGameResults(gameData);
    await GameModeService.updateModeStats(this.modeId, gameData);

    console.log('Survival mode completed:', gameData);
    return gameData;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get UI components for survival mode
   */
  getUIComponents() {
    return {
      LivesDisplay: this.LivesDisplay,
      LevelDisplay: this.LevelDisplay,
      TimeDisplay: this.TimeDisplay,
      ScoreDisplay: this.ScoreDisplay,
      StreakDisplay: this.StreakDisplay
    };
  }

  /**
   * Lives display component
   */
  LivesDisplay = ({ style }) => {
    const [lives, setLives] = useState(this.gameState.lives);

    useEffect(() => {
      const interval = setInterval(() => {
        setLives(this.gameState.lives);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.livesContainer, style]}>
        {[...Array(this.gameState.maxLives)].map((_, index) => (
          <Ionicons
            key={index}
            name={index < lives ? "heart" : "heart-outline"}
            size={20}
            color={index < lives ? "#FF6B6B" : "#666"}
          />
        ))}
      </View>
    );
  };

  /**
   * Level display component
   */
  LevelDisplay = ({ style }) => {
    const [level, setLevel] = useState(this.gameState.level);

    useEffect(() => {
      const interval = setInterval(() => {
        setLevel(this.gameState.level);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.levelContainer, style]}>
        <Text style={styles.levelLabel}>LEVEL</Text>
        <Text style={styles.levelValue}>{level}</Text>
      </View>
    );
  };

  /**
   * Time display component
   */
  TimeDisplay = ({ style }) => {
    const [timeRemaining, setTimeRemaining] = useState(this.getTimeRemaining());

    useEffect(() => {
      const interval = setInterval(() => {
        setTimeRemaining(this.getTimeRemaining());
      }, 100);

      return () => clearInterval(interval);
    }, []);

    const isWarning = timeRemaining <= 10;
    const isCritical = timeRemaining <= 5;

    return (
      <View style={[styles.timeContainer, style]}>
        <Text style={[
          styles.timeText,
          isWarning && styles.timeWarning,
          isCritical && styles.timeCritical
        ]}>
          {Math.ceil(timeRemaining)}s
        </Text>
      </View>
    );
  };

  /**
   * Score display component
   */
  ScoreDisplay = ({ style }) => {
    const [score, setScore] = useState(this.gameState.score);

    useEffect(() => {
      const interval = setInterval(() => {
        setScore(this.gameState.score);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.scoreContainer, style]}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
      </View>
    );
  };

  /**
   * Streak display component
   */
  StreakDisplay = ({ style }) => {
    const [streak, setStreak] = useState(this.gameState.streak);

    useEffect(() => {
      const interval = setInterval(() => {
        setStreak(this.gameState.streak);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.streakContainer, style]}>
        <Ionicons name="flash" size={16} color="#FFD700" />
        <Text style={styles.streakText}>{streak}</Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  levelLabel: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: 'bold',
  },
  levelValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeWarning: {
    color: '#FF9800',
  },
  timeCritical: {
    color: '#FF5722',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 4,
  },
});

export default SurvivalMode;