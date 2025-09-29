import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

// Core Game Components
import GameScreen from './components/screens/GameScreen';
import StartScreen from './components/screens/StartScreen';
import GameOverScreen from './components/screens/GameOverScreen';
import RulesScreen from './components/screens/RulesScreen';

// New Feature Components
import StoreScreen from './components/monetization/StoreScreen';
import AchievementScreen from './components/achievements/AchievementScreen';
import RewardScreen from './components/achievements/RewardScreen';
import GameModeSelector from './components/modes/GameModeSelector';
import AchievementNotification from './components/achievements/AchievementNotification';

// Services
import WordService from './services/WordService';

// Hooks
import { useGameState } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';

// Styles
import { globalStyles } from './styles/globalStyles';

// Constants
import { GAME_CONFIG, SCORING, ANIMATIONS } from './utils/constants';

/**
 * SimpleApp - Simplified version with basic new features
 */
export default function SimpleApp() {
  const [appState, setAppState] = useState({
    fontLoaded: false,
    currentScreen: 'start',
    showStore: false,
    showAchievements: false,
    showRewards: false,
    showGameModes: false,
    servicesInitialized: false,
    userStats: {
      coins: 1000,
      hints: 5,
      lives: 3,
      level: 1,
      xp: 0
    }
  });

  const gameState = useGameState();
  const timer = useTimer(() => handleTimeOut());

  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize the app
   */
  const initializeApp = async () => {
    try {
      console.log('SimpleApp: Initializing...');
      
      // Load fonts
      await loadFonts();
      
      // Initialize basic services
      await initializeServices();
      
      console.log('SimpleApp: Initialization complete');
    } catch (error) {
      console.error('SimpleApp: Initialization failed:', error);
    }
  };

  /**
   * Load fonts
   */
  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Bodoni Moda': require('../assets/fonts/BodoniModa-Italic-VariableFont_opsz,wght.ttf'),
      });
      setAppState(prev => ({ ...prev, fontLoaded: true }));
    } catch (error) {
      console.error('Failed to load fonts:', error);
      setAppState(prev => ({ ...prev, fontLoaded: true })); // Continue anyway
    }
  };

  /**
   * Initialize basic services
   */
  const initializeServices = async () => {
    try {
      // Initialize WordService
      await WordService.initialize();
      
      // Load user stats
      await loadUserStats();
      
      setAppState(prev => ({ ...prev, servicesInitialized: true }));
      console.log('SimpleApp: Services initialized');
    } catch (error) {
      console.error('SimpleApp: Service initialization failed:', error);
    }
  };

  /**
   * Load user stats from storage
   */
  const loadUserStats = async () => {
    try {
      const coins = await loadFromStorage('user_coins', 1000);
      const hints = await loadFromStorage('user_hints', 5);
      const lives = await loadFromStorage('user_lives', 3);
      const level = await loadFromStorage('user_level', 1);
      const xp = await loadFromStorage('user_xp', 0);

      setAppState(prev => ({
        ...prev,
        userStats: { coins, hints, lives, level, xp }
      }));
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  /**
   * Load value from AsyncStorage with default
   */
  const loadFromStorage = async (key, defaultValue) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? parseInt(value) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  /**
   * Start game
   */
  const startGame = async () => {
    try {
      console.log('Starting game...');
      
      // Start the game
      gameState.startGame();
      setAppState(prev => ({ ...prev, currentScreen: 'game' }));

      // Generate initial puzzle
      const puzzleData = await WordService.generateFreshPuzzle();
      gameState.updateWords(puzzleData.start, puzzleData.end);

      // Start timer
      const newTime = timer.calculateTimerDuration(gameState.level);
      timer.startTimer(newTime);

    } catch (error) {
      console.error('Failed to start game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  /**
   * Handle game end
   */
  const handleGameEnd = async () => {
    try {
      console.log('Game ended');
      
      // Show game over screen
      setAppState(prev => ({ ...prev, currentScreen: 'gameOver' }));

    } catch (error) {
      console.error('Failed to handle game end:', error);
    }
  };

  /**
   * Handle timeout
   */
  const handleTimeOut = async () => {
    gameState.resetStreak();
    gameState.setErrorState(null);
    
    if (gameState.bonusRounds) {
      handleGameEnd();
      return;
    }
    
    if (gameState.gameActiveRef.current) {
      await nextPuzzle(null);
    }
  };

  /**
   * Next puzzle logic
   */
  const nextPuzzle = async (correctAnswer = null) => {
    gameState.setCurrentPuzzle(prev => prev + 1);
    
    const currentRounds = gameState.roundsRemaining;
    
    if (currentRounds > 1) {
      gameState.setRoundsRemaining(currentRounds - 1);
    } else if (currentRounds === 1) {
      if (correctAnswer && !gameState.bonusRounds) {
        gameState.setBonusRounds(true);
        gameState.setRoundsRemaining(0);
      } else {
        handleGameEnd();
        return;
      }
    } else if (currentRounds <= 0) {
      if (gameState.bonusRounds) {
        if (!correctAnswer) {
          handleGameEnd();
          return;
        }
      } else {
        handleGameEnd();
        return;
      }
    }
    
    // Get new words for chaining
    const newStartWords = await WordService.fetchWordsForChaining(1, gameState.solved, [gameState.startWord, gameState.endWord]);
    const chainedStartWord = newStartWords[0];
    const chainedEndWord = correctAnswer || gameState.currentStartWordRef.current;
    
    gameState.updateWords(chainedStartWord, chainedEndWord);
    
    // Reset timer
    const newTime = timer.calculateTimerDuration(gameState.level);
    timer.startTimer(newTime);
  };

  /**
   * Handle word submission
   */
  const handleSubmit = async () => {
    const word = gameState.currentWord.trim().toUpperCase();
    
    if (!gameState.gameActive) return;
    
    if (word.length !== 5) {
      gameState.setErrorState('invalid');
      setTimeout(() => {
        gameState.updateCurrentWord('');
        gameState.setErrorState(null);
      }, 1000);
      return;
    }

    if (word === gameState.startWord.toUpperCase() || word === gameState.endWord.toUpperCase()) {
      gameState.setErrorState('invalid');
      setTimeout(() => {
        gameState.updateCurrentWord('');
        gameState.setErrorState(null);
      }, 1000);
      return;
    }

    const isValidBridge = await WordService.validateBridgeWord(word, gameState.startWord, gameState.endWord);
    
    if (isValidBridge) {
      timer.stopTimer();
      
      gameState.incrementSolved();
      gameState.incrementStreak();
      
      const timeBonus = timer.getTimeBonus();
      const speedBonus = timer.getTimeBasedBonus().bonus;
      const newStreak = gameState.streak + 1;
      const streakMultiplier = Math.min(newStreak, SCORING.MAX_STREAK_MULTIPLIER);
      const levelBonus = gameState.level * SCORING.LEVEL_BONUS_MULTIPLIER;
      const points = (SCORING.BASE_POINTS + timeBonus + speedBonus + levelBonus) * streakMultiplier;
      
      gameState.updateScore(points);
      gameState.setErrorState('success');
      
      setTimeout(async () => {
        if (gameState.gameActive) {
          await nextPuzzle(word);
        }
      }, 1500);
      
    } else {
      gameState.resetStreak();
      gameState.setErrorState('invalid');
      
      if (gameState.bonusRounds) {
        setTimeout(() => {
          handleGameEnd();
        }, 1000);
        return;
      }
      
      setTimeout(() => {
        gameState.updateCurrentWord('');
        gameState.setErrorState(null);
      }, 1000);
    }
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (letter) => {
    if (letter === 'BACKSPACE') {
      gameState.updateCurrentWord(gameState.currentWord.slice(0, -1));
    } else if (letter === 'ENTER') {
      if (gameState.currentWord.trim().length === 5) {
        handleSubmit();
      }
    } else {
      if (gameState.currentWord.length < 5) {
        gameState.updateCurrentWord(gameState.currentWord + letter);
      }
    }
  };

  /**
   * Skip puzzle
   */
  const skipPuzzle = async () => {
    gameState.updateScore(SCORING.SKIP_PENALTY);
    gameState.resetStreak();
    timer.stopTimer();
    gameState.setErrorState('skipped');
    
    if (gameState.bonusRounds) {
      setTimeout(() => {
        handleGameEnd();
      }, 800);
      return;
    }
    
    setTimeout(async () => {
      if (gameState.gameActive) {
        await nextPuzzle(null);
      }
    }, 800);
  };

  /**
   * Render current screen
   */
  const renderCurrentScreen = () => {
    switch (appState.currentScreen) {
      case 'start':
        return (
          <StartScreen 
            gameState={gameState}
            onStartGame={startGame}
            onShowRules={() => gameState.toggleRules()}
            onShowStore={() => setAppState(prev => ({ ...prev, showStore: true }))}
            onShowAchievements={() => setAppState(prev => ({ ...prev, showAchievements: true }))}
            onShowRewards={() => setAppState(prev => ({ ...prev, showRewards: true }))}
            onShowGameModes={() => setAppState(prev => ({ ...prev, showGameModes: true }))}
          />
        );

      case 'game':
        return (
          <GameScreen 
            gameState={gameState}
            timer={timer}
            animations={{
              confirmAnim: { value: 1 },
              keyPressAnim: { value: 1 },
              streakAnim: { value: 0 },
              successMessageAnim: { value: 0 }
            }}
            onKeyPress={handleKeyPress}
            onSkipPuzzle={skipPuzzle}
            onShowRules={() => gameState.toggleRules()}
          />
        );

      case 'gameOver':
        return (
          <GameOverScreen 
            gameState={gameState} 
            onPlayAgain={startGame} 
            onShowStore={() => setAppState(prev => ({ ...prev, showStore: true }))}
            onShowAchievements={() => setAppState(prev => ({ ...prev, showAchievements: true }))}
          />
        );

      default:
        return (
          <StartScreen 
            gameState={gameState}
            onStartGame={startGame}
            onShowRules={() => gameState.toggleRules()}
          />
        );
    }
  };

  /**
   * Render modals and overlays
   */
  const renderModals = () => {
    return (
      <>
        {/* Store Screen */}
        {appState.showStore && (
          <StoreScreen
            onBack={() => setAppState(prev => ({ ...prev, showStore: false }))}
            userCoins={appState.userStats.coins}
            userHints={appState.userStats.hints}
            userLives={appState.userStats.lives}
          />
        )}

        {/* Achievement Screen */}
        {appState.showAchievements && (
          <AchievementScreen
            onBack={() => setAppState(prev => ({ ...prev, showAchievements: false }))}
          />
        )}

        {/* Reward Screen */}
        {appState.showRewards && (
          <RewardScreen
            onBack={() => setAppState(prev => ({ ...prev, showRewards: false }))}
            playerLevel={appState.userStats.level}
          />
        )}

        {/* Game Mode Selector */}
        {appState.showGameModes && (
          <GameModeSelector
            onBack={() => setAppState(prev => ({ ...prev, showGameModes: false }))}
            onModeSelect={(mode) => {
              setAppState(prev => ({ ...prev, showGameModes: false }));
              startGame();
            }}
            playerLevel={appState.userStats.level}
            playerStats={{}}
          />
        )}

        {/* Rules Screen */}
        {gameState.showRules && (
          <RulesScreen 
            gameState={gameState} 
            onClose={() => gameState.toggleRules()} 
          />
        )}
      </>
    );
  };

  // Show loading screen
  if (!appState.fontLoaded || !appState.servicesInitialized) {
    return (
      <SafeAreaProvider>
        <View style={[globalStyles.fullScreenContainer, globalStyles.centered]}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading ChainLink...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show main app
  return (
    <SafeAreaProvider>
      <View style={globalStyles.fullScreenContainer}>
        {renderCurrentScreen()}
        {renderModals()}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
});
