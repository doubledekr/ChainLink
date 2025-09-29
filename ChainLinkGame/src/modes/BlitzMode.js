import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameModeService from '../services/GameModeService';

/**
 * BlitzMode - 60-second rapid fire mode implementation
 */
class BlitzMode {
  constructor() {
    this.modeId = 'BLITZ';
    this.config = GameModeService.getGameMode(this.modeId);
    this.gameState = {
      timeRemaining: 60,
      score: 0,
      puzzlesCompleted: 0,
      streak: 0,
      multiplier: 1.0,
      startTime: null,
      isActive: false
    };
  }

  /**
   * Initialize blitz mode
   */
  async initialize() {
    try {
      this.gameState.startTime = Date.now();
      this.gameState.isActive = true;
      
      // Start the 60-second timer
      this.startTimer();
      
      console.log('Blitz mode initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize blitz mode:', error);
      return false;
    }
  }

  /**
   * Start the 60-second timer
   */
  startTimer() {
    this.timer = setInterval(() => {
      this.gameState.timeRemaining -= 1;
      
      // Update multiplier based on remaining time
      this.updateMultiplier();
      
      // Check if time is up
      if (this.gameState.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * Update score multiplier based on time remaining
   */
  updateMultiplier() {
    if (this.gameState.timeRemaining > 45) {
      this.gameState.multiplier = 2.0;
    } else if (this.gameState.timeRemaining > 30) {
      this.gameState.multiplier = 1.8;
    } else if (this.gameState.timeRemaining > 15) {
      this.gameState.multiplier = 1.5;
    } else {
      this.gameState.multiplier = 1.2;
    }
  }

  /**
   * Handle puzzle completion
   */
  handlePuzzleComplete(puzzleData) {
    if (!this.gameState.isActive) return;

    this.gameState.puzzlesCompleted += 1;
    this.gameState.streak += 1;

    // Calculate score with multiplier
    const baseScore = puzzleData.baseScore || 100;
    const timeBonus = this.calculateTimeBonus(puzzleData.solveTime);
    const streakBonus = this.calculateStreakBonus();
    
    const puzzleScore = Math.round(
      (baseScore + timeBonus + streakBonus) * this.gameState.multiplier
    );
    
    this.gameState.score += puzzleScore;

    console.log(`Puzzle completed: +${puzzleScore} points (${this.gameState.streak} streak)`);
  }

  /**
   * Handle puzzle failure
   */
  handlePuzzleFailure() {
    if (!this.gameState.isActive) return;

    this.gameState.streak = 0;
    console.log('Streak broken');
  }

  /**
   * Calculate time bonus for solving quickly
   */
  calculateTimeBonus(solveTime) {
    if (solveTime <= 5) return 50;
    if (solveTime <= 10) return 30;
    if (solveTime <= 15) return 20;
    return 10;
  }

  /**
   * Calculate streak bonus
   */
  calculateStreakBonus() {
    if (this.gameState.streak >= 10) return 100;
    if (this.gameState.streak >= 5) return 50;
    if (this.gameState.streak >= 3) return 25;
    return 0;
  }

  /**
   * End the game
   */
  async endGame() {
    if (!this.gameState.isActive) return;

    this.gameState.isActive = false;
    clearInterval(this.timer);

    const gameData = {
      finalScore: this.gameState.score,
      puzzlesCompleted: this.gameState.puzzlesCompleted,
      timePlayed: 60 - this.gameState.timeRemaining,
      maxStreak: this.gameState.streak,
      averageScore: this.gameState.puzzlesCompleted > 0 
        ? Math.round(this.gameState.score / this.gameState.puzzlesCompleted) 
        : 0,
      modeId: this.modeId
    };

    // Save results
    await GameModeService.saveGameResults(gameData);
    await GameModeService.updateModeStats(this.modeId, gameData);

    console.log('Blitz mode completed:', gameData);
    return gameData;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get UI components for blitz mode
   */
  getUIComponents() {
    return {
      TimerDisplay: this.TimerDisplay,
      ScoreDisplay: this.ScoreDisplay,
      MultiplierDisplay: this.MultiplierDisplay,
      StreakDisplay: this.StreakDisplay
    };
  }

  /**
   * Timer display component
   */
  TimerDisplay = ({ style }) => {
    const [timeRemaining, setTimeRemaining] = useState(this.gameState.timeRemaining);

    useEffect(() => {
      const interval = setInterval(() => {
        setTimeRemaining(this.gameState.timeRemaining);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    const getTimerColor = () => {
      if (timeRemaining > 30) return '#4CAF50';
      if (timeRemaining > 15) return '#FFA726';
      return '#F44336';
    };

    return (
      <View style={[styles.timerContainer, style]}>
        <Ionicons name="flash" size={20} color={getTimerColor()} />
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {timeRemaining}s
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
        <Ionicons name="trophy" size={20} color="#FFD700" />
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
      </View>
    );
  };

  /**
   * Multiplier display component
   */
  MultiplierDisplay = ({ style }) => {
    const [multiplier, setMultiplier] = useState(this.gameState.multiplier);

    useEffect(() => {
      const interval = setInterval(() => {
        setMultiplier(this.gameState.multiplier);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.multiplierContainer, style]}>
        <Text style={styles.multiplierLabel}>x{multiplier.toFixed(1)}</Text>
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
        <Ionicons name="flame" size={20} color="#FF6B6B" />
        <Text style={styles.streakText}>{streak}</Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 4,
  },
  multiplierContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  multiplierLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginLeft: 4,
  },
});

export default BlitzMode;
