import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameModeService from '../services/GameModeService';

/**
 * TournamentMode - Competitive bracket-style gameplay
 */
class TournamentMode {
  constructor() {
    this.modeId = 'TOURNAMENT';
    this.config = GameModeService.getGameMode(this.modeId);
    this.gameState = {
      tournamentId: null,
      round: 1,
      totalRounds: 4,
      bracketPosition: 0,
      opponent: null,
      score: 0,
      opponentScore: 0,
      wins: 0,
      losses: 0,
      isActive: false,
      startTime: null,
      roundStartTime: null,
      roundTimeLimit: 60, // 60 seconds per round
      tournamentData: {
        participants: [],
        brackets: [],
        currentRound: 1,
        isComplete: false
      },
      roundResults: []
    };
  }

  /**
   * Initialize tournament mode
   */
  async initialize(tournamentConfig = {}) {
    try {
      this.gameState.startTime = Date.now();
      this.gameState.roundStartTime = Date.now();
      this.gameState.isActive = true;
      
      // Generate tournament if not provided
      if (!tournamentConfig.tournamentId) {
        await this.generateTournament();
      } else {
        this.gameState.tournamentId = tournamentConfig.tournamentId;
        await this.loadTournament();
      }
      
      console.log('Tournament mode initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize tournament mode:', error);
      return false;
    }
  }

  /**
   * Generate a new tournament
   */
  async generateTournament() {
    const tournamentId = `tournament_${Date.now()}`;
    this.gameState.tournamentId = tournamentId;
    
    // Generate 8 participants (including player)
    const participants = this.generateParticipants();
    this.gameState.tournamentData.participants = participants;
    
    // Generate brackets
    const brackets = this.generateBrackets(participants);
    this.gameState.tournamentData.brackets = brackets;
    
    // Set player position
    this.gameState.bracketPosition = 0; // Player is always first
    
    console.log('Tournament generated:', tournamentId);
  }

  /**
   * Generate tournament participants
   */
  generateParticipants() {
    const playerName = "You";
    const aiNames = [
      "WordMaster", "PuzzlePro", "ChainChamp", "LinkLegend",
      "BrainBox", "WordWizard", "PuzzleKing", "ChainHero"
    ];
    
    const participants = [playerName];
    for (let i = 0; i < 7; i++) {
      participants.push(aiNames[i]);
    }
    
    return participants;
  }

  /**
   * Generate tournament brackets
   */
  generateBrackets(participants) {
    const brackets = [];
    
    // Shuffle participants (except player who stays first)
    const shuffled = [participants[0], ...participants.slice(1).sort(() => Math.random() - 0.5)];
    
    // Generate matchups for each round
    for (let round = 1; round <= 3; round++) {
      const roundMatches = [];
      const participantsInRound = round === 1 ? shuffled : brackets[round - 2].map(match => match.winner);
      
      for (let i = 0; i < participantsInRound.length; i += 2) {
        roundMatches.push({
          player1: participantsInRound[i],
          player2: participantsInRound[i + 1],
          winner: null,
          score1: 0,
          score2: 0
        });
      }
      
      brackets.push(roundMatches);
    }
    
    return brackets;
  }

  /**
   * Load existing tournament
   */
  async loadTournament() {
    // In a real implementation, this would load from a database
    // For now, we'll generate a new one
    await this.generateTournament();
  }

  /**
   * Handle puzzle completion
   */
  handlePuzzleComplete(puzzleData) {
    if (!this.gameState.isActive) return;

    const baseScore = puzzleData.baseScore || 50;
    const roundBonus = this.calculateRoundBonus();
    const timeBonus = this.calculateTimeBonus();
    const tournamentBonus = this.calculateTournamentBonus();
    
    const puzzleScore = Math.round(baseScore + roundBonus + timeBonus + tournamentBonus);
    this.gameState.score += puzzleScore;

    console.log(`Puzzle completed: +${puzzleScore} points (Round ${this.gameState.round})`);
  }

  /**
   * Handle puzzle failure
   */
  handlePuzzleFailure() {
    if (!this.gameState.isActive) return;

    // In tournament mode, failures don't end the game, just reduce score
    const penalty = 25;
    this.gameState.score = Math.max(0, this.gameState.score - penalty);

    console.log(`Puzzle failed! Score penalty: -${penalty}`);
  }

  /**
   * Calculate round bonus
   */
  calculateRoundBonus() {
    return this.gameState.round * 20;
  }

  /**
   * Calculate time bonus
   */
  calculateTimeBonus() {
    const timeElapsed = (Date.now() - this.gameState.roundStartTime) / 1000;
    const timeRemaining = this.gameState.roundTimeLimit - timeElapsed;
    
    if (timeRemaining > 0) {
      return Math.round(timeRemaining * 1.5);
    }
    return 0;
  }

  /**
   * Calculate tournament bonus
   */
  calculateTournamentBonus() {
    // Bonus for winning streaks
    return this.gameState.wins * 15;
  }

  /**
   * Use a hint
   */
  useHint() {
    if (!this.gameState.isActive) return false; // No hints in tournament mode

    console.log('No hints available in tournament mode');
    return false;
  }

  /**
   * Complete current round
   */
  async completeRound() {
    if (!this.gameState.isActive) return;

    // Generate opponent score (AI)
    const opponentScore = this.generateOpponentScore();
    this.gameState.opponentScore = opponentScore;
    
    // Determine winner
    const isWinner = this.gameState.score > opponentScore;
    
    if (isWinner) {
      this.gameState.wins += 1;
    } else {
      this.gameState.losses += 1;
    }
    
    // Save round result
    const roundResult = {
      round: this.gameState.round,
      playerScore: this.gameState.score,
      opponentScore: opponentScore,
      isWinner: isWinner,
      timeElapsed: (Date.now() - this.gameState.roundStartTime) / 1000
    };
    
    this.gameState.roundResults.push(roundResult);
    
    // Update tournament brackets
    this.updateTournamentBrackets(roundResult);
    
    console.log(`Round ${this.gameState.round} completed. ${isWinner ? 'Won' : 'Lost'}!`);
    
    // Check if tournament is complete
    if (this.gameState.round >= this.gameState.totalRounds || this.gameState.losses > 0) {
      await this.endTournament();
    } else {
      // Advance to next round
      this.advanceToNextRound();
    }
    
    return roundResult;
  }

  /**
   * Generate opponent score (AI)
   */
  generateOpponentScore() {
    // AI score based on player performance and difficulty
    const baseScore = this.gameState.score * 0.8;
    const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    const difficultyFactor = this.gameState.round * 0.1; // Slightly harder each round
    
    return Math.round(baseScore * randomFactor * (1 + difficultyFactor));
  }

  /**
   * Update tournament brackets
   */
  updateTournamentBrackets(roundResult) {
    const currentBracket = this.gameState.tournamentData.brackets[this.gameState.round - 1];
    if (currentBracket && currentBracket[0]) {
      currentBracket[0].score1 = roundResult.playerScore;
      currentBracket[0].score2 = roundResult.opponentScore;
      currentBracket[0].winner = roundResult.isWinner ? "You" : "AI Opponent";
    }
  }

  /**
   * Advance to next round
   */
  advanceToNextRound() {
    this.gameState.round += 1;
    this.gameState.roundStartTime = Date.now();
    this.gameState.score = 0; // Reset score for new round
    this.gameState.opponentScore = 0;
    
    console.log(`Advanced to round ${this.gameState.round}`);
  }

  /**
   * End tournament
   */
  async endTournament() {
    if (!this.gameState.isActive) return;

    this.gameState.isActive = false;
    const totalTime = (Date.now() - this.gameState.startTime) / 1000;
    
    const tournamentData = {
      tournamentId: this.gameState.tournamentId,
      finalRound: this.gameState.round,
      wins: this.gameState.wins,
      losses: this.gameState.losses,
      totalTime: Math.round(totalTime),
      roundResults: this.gameState.roundResults,
      isChampion: this.gameState.losses === 0,
      modeId: this.modeId
    };

    // Save results
    await GameModeService.saveGameResults(tournamentData);
    await GameModeService.updateModeStats(this.modeId, tournamentData);

    console.log('Tournament completed:', tournamentData);
    return tournamentData;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get tournament status
   */
  getTournamentStatus() {
    const timeRemaining = this.getTimeRemaining();
    const currentMatch = this.gameState.tournamentData.brackets[this.gameState.round - 1]?.[0];
    
    return {
      round: this.gameState.round,
      totalRounds: this.gameState.totalRounds,
      score: this.gameState.score,
      opponentScore: this.gameState.opponentScore,
      timeRemaining: timeRemaining,
      wins: this.gameState.wins,
      losses: this.gameState.losses,
      currentMatch: currentMatch,
      isChampion: this.gameState.losses === 0 && this.gameState.round > 1
    };
  }

  /**
   * Get time remaining for current round
   */
  getTimeRemaining() {
    const timeElapsed = (Date.now() - this.gameState.roundStartTime) / 1000;
    return Math.max(0, this.gameState.roundTimeLimit - timeElapsed);
  }

  /**
   * Get UI components for tournament mode
   */
  getUIComponents() {
    return {
      RoundDisplay: this.RoundDisplay,
      ScoreDisplay: this.ScoreDisplay,
      TimeDisplay: this.TimeDisplay,
      BracketDisplay: this.BracketDisplay,
      OpponentDisplay: this.OpponentDisplay
    };
  }

  /**
   * Round display component
   */
  RoundDisplay = ({ style }) => {
    const [round, setRound] = useState(this.gameState.round);

    useEffect(() => {
      const interval = setInterval(() => {
        setRound(this.gameState.round);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.roundContainer, style]}>
        <Text style={styles.roundLabel}>ROUND</Text>
        <Text style={styles.roundValue}>{round}/{this.gameState.totalRounds}</Text>
      </View>
    );
  };

  /**
   * Score display component
   */
  ScoreDisplay = ({ style }) => {
    const [score, setScore] = useState(this.gameState.score);
    const [opponentScore, setOpponentScore] = useState(this.gameState.opponentScore);

    useEffect(() => {
      const interval = setInterval(() => {
        setScore(this.gameState.score);
        setOpponentScore(this.gameState.opponentScore);
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.scoreContainer, style]}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>YOU</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <Text style={styles.scoreSeparator}>VS</Text>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>OPPONENT</Text>
          <Text style={styles.scoreValue}>{opponentScore}</Text>
        </View>
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

    const isWarning = timeRemaining <= 15;
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
   * Bracket display component
   */
  BracketDisplay = ({ style }) => {
    const [status, setStatus] = useState(this.getTournamentStatus());

    useEffect(() => {
      const interval = setInterval(() => {
        setStatus(this.getTournamentStatus());
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.bracketContainer, style]}>
        <Text style={styles.bracketLabel}>TOURNAMENT</Text>
        <Text style={styles.bracketValue}>
          {status.wins}W - {status.losses}L
        </Text>
      </View>
    );
  };

  /**
   * Opponent display component
   */
  OpponentDisplay = ({ style }) => {
    const [status, setStatus] = useState(this.getTournamentStatus());

    useEffect(() => {
      const interval = setInterval(() => {
        setStatus(this.getTournamentStatus());
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <View style={[styles.opponentContainer, style]}>
        <Text style={styles.opponentLabel}>VS</Text>
        <Text style={styles.opponentValue}>
          {status.currentMatch?.player2 || 'AI Opponent'}
        </Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  roundContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  roundLabel: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: 'bold',
  },
  roundValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreSeparator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginHorizontal: 16,
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
  bracketContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bracketLabel: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: 'bold',
  },
  bracketValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  opponentContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  opponentLabel: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: 'bold',
  },
  opponentValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default TournamentMode;
