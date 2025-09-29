import { useState, useRef } from 'react';
import { GAME_CONFIG, GAME_MODES } from '../utils/constants';
import { useLeaderboards } from './useLeaderboards';
import { useUserProfile } from './useUserProfile';

export const useGameState = () => {
  // Leaderboard and profile hooks
  const leaderboards = useLeaderboards();
  const userProfile = useUserProfile();
  
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameMode, setGameMode] = useState(GAME_MODES.SINGLE);
  const [multiplayerInitialized, setMultiplayerInitialized] = useState(false);
  const [startWord, setStartWord] = useState('TOWER');
  const [endWord, setEndWord] = useState('BEACH');
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [roundsRemaining, setRoundsRemaining] = useState(GAME_CONFIG.ROUNDS_PER_GAME);
  const [bonusRounds, setBonusRounds] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  
  // UI state
  const [error, setError] = useState(null);
  const [keyPressed, setKeyPressed] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  
  // Refs to store current words for timer callbacks
  const currentStartWordRef = useRef('');
  const currentEndWordRef = useRef('');
  const gameActiveRef = useRef(false);

  /**
   * Reset the game to initial state
   */
  const resetGame = () => {
    setGameActive(false);
    gameActiveRef.current = false;
    setScore(0);
    setStreak(0);
    setSolved(0);
    setLevel(1);
    setCurrentPuzzle(0);
    setRoundsRemaining(GAME_CONFIG.ROUNDS_PER_GAME);
    setBonusRounds(false);
    setShowGameOver(false);
    setCurrentWord('');
    setError(null);
    setKeyPressed(null);
    setShowStreak(false);
  };

  /**
   * Start a new game
   */
  const startGame = () => {
    console.log('🎮 Starting game - setting gameActive to true');
    setGameActive(true);
    gameActiveRef.current = true;
    setScore(0);
    setStreak(0);
    setSolved(0);
    setLevel(1);
    setCurrentPuzzle(0);
    setRoundsRemaining(GAME_CONFIG.ROUNDS_PER_GAME);
    setBonusRounds(false);
    setShowGameOver(false);
    setCurrentWord('');
    setError(null);
  };

  /**
   * End the current game
   */
  const endGame = async () => {
    console.log('🎮 Ending game - setting gameActive to false');
    setGameActive(false);
    gameActiveRef.current = false;
    setShowGameOver(true);
    
    // Submit game data to leaderboards and user profile
    await submitGameData();
  };

  /**
   * Submit game data to leaderboards and update user profile
   */
  const submitGameData = async () => {
    try {
      const gameData = {
        finalScore: score,
        weeklyScore: score, // This will be accumulated in the service
        streakRecord: streak,
        solveTime: 30, // Placeholder - should be calculated from actual game time
        won: score > 0,
        perfectGame: streak === solved && solved > 0,
        gamesPlayed: 1
      };

      // Submit to leaderboards
      if (leaderboards.isInitialized) {
        await leaderboards.submitGameScores(gameData);
      }

      // Update user profile
      if (userProfile.isInitialized) {
        await userProfile.updateGameStats(gameData);
      }

      console.log('✅ Game data submitted successfully');
    } catch (error) {
      console.error('❌ Failed to submit game data:', error);
    }
  };

  /**
   * Update the current words and refs
   * @param {string} newStartWord - New start word
   * @param {string} newEndWord - New end word
   */
  const updateWords = (newStartWord, newEndWord) => {
    setStartWord(newStartWord);
    setEndWord(newEndWord);
    setCurrentWord('');
    setError(null);
    
    // Update refs for timer callbacks
    currentStartWordRef.current = newStartWord;
    currentEndWordRef.current = newEndWord;
  };

  /**
   * Update the score by adding points
   * @param {number} points - Points to add
   */
  const updateScore = (points) => {
    setScore(prev => prev + points);
  };

  /**
   * Increment the current streak
   */
  const incrementStreak = () => {
    setStreak(prev => prev + 1);
  };

  /**
   * Reset the streak to 0
   */
  const resetStreak = () => {
    setStreak(0);
  };

  /**
   * Increment solved puzzles and handle level ups
   */
  const incrementSolved = () => {
    setSolved(prev => {
      const newSolved = prev + 1;
      // Level up every 5 solves
      if (newSolved % GAME_CONFIG.LEVEL_UP_THRESHOLD === 0) {
        setLevel(prevLevel => prevLevel + 1);
      }
      return newSolved;
    });
  };

  /**
   * Update current word input
   * @param {string} word - New current word
   */
  const updateCurrentWord = (word) => {
    setCurrentWord(word);
  };

  /**
   * Set error state
   * @param {string|null} errorType - Error type or null to clear
   */
  const setErrorState = (errorType) => {
    setError(errorType);
  };

  /**
   * Set key pressed for animation
   * @param {string|null} key - Key that was pressed or null
   */
  const setKeyPressedState = (key) => {
    setKeyPressed(key);
  };

  /**
   * Toggle rules screen visibility
   */
  const toggleRules = () => {
    setShowRules(prev => !prev);
  };

  /**
   * Show streak animation
   * @param {boolean} show - Whether to show streak
   */
  const setShowStreakState = (show) => {
    setShowStreak(show);
  };

  /**
   * Update puzzle progress
   * @param {number} newPuzzleIndex - New puzzle index
   * @param {number} newRoundsRemaining - New rounds remaining
   * @param {boolean} isBonusRound - Whether in bonus rounds
   */
  const updatePuzzleProgress = (newPuzzleIndex, newRoundsRemaining, isBonusRound = false) => {
    setCurrentPuzzle(newPuzzleIndex);
    setRoundsRemaining(newRoundsRemaining);
    setBonusRounds(isBonusRound);
  };

  /**
   * Set multiplayer initialization status
   * @param {boolean} initialized - Whether multiplayer is initialized
   */
  const setMultiplayerInitializedState = (initialized) => {
    setMultiplayerInitialized(initialized);
  };

  /**
   * Set game mode
   * @param {string} mode - Game mode (single/multiplayer)
   */
  const setGameModeState = (mode) => {
    setGameMode(mode);
  };

  return {
    // State
    gameActive,
    gameMode,
    multiplayerInitialized,
    startWord,
    endWord,
    currentWord,
    score,
    streak,
    solved,
    level,
    currentPuzzle,
    roundsRemaining,
    bonusRounds,
    showGameOver,
    error,
    keyPressed,
    showRules,
    showStreak,
    
    // Refs
    currentStartWordRef,
    currentEndWordRef,
    gameActiveRef,
    
    // Actions
    resetGame,
    startGame,
    endGame,
    updateWords,
    updateScore,
    incrementStreak,
    resetStreak,
    incrementSolved,
    updateCurrentWord,
    setErrorState,
    setKeyPressedState,
    toggleRules,
    setShowStreakState,
    updatePuzzleProgress,
    setMultiplayerInitializedState,
    setGameModeState,
    
    // Leaderboard integration
    leaderboards,
    userProfile,
    submitGameData,
    
    // Setters for direct state updates (when needed)
    setGameActive,
    setGameMode,
    setMultiplayerInitialized,
    setStartWord,
    setEndWord,
    setCurrentWord,
    setScore,
    setStreak,
    setSolved,
    setLevel,
    setCurrentPuzzle,
    setRoundsRemaining,
    setBonusRounds,
    setShowGameOver,
    setError,
    setKeyPressed,
    setShowRules,
    setShowStreak
  };
};
