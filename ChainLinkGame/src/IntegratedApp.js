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

// Integration Components
import AppInitializer from './components/integration/AppInitializer';
import FeatureFlagDebugger from './components/integration/FeatureFlagDebugger';

// Core Game Components
import GameScreen from './components/screens/GameScreen';
import StartScreen from './components/screens/StartScreen';
import GameOverScreen from './components/screens/GameOverScreen';
import RulesScreen from './components/screens/RulesScreen';

// New Feature Components
import StoreScreen from './components/monetization/StoreScreen';
import LightningPassScreen from './components/monetization/LightningPassScreen';
import AchievementScreen from './components/achievements/AchievementScreen';
import RewardScreen from './components/achievements/RewardScreen';
import GameModeSelector from './components/modes/GameModeSelector';
import GameModeUI from './components/modes/GameModeUI';
import GameModeResults from './components/modes/GameModeResults';
import AchievementNotification from './components/achievements/AchievementNotification';

// Services
import IntegrationService from './services/IntegrationService';
import WordService from './services/WordService';
import GameModeService from './services/GameModeService';
import AchievementService from './services/AchievementService';
import RewardService from './services/RewardService';
import AdService from './services/AdService';
import IAPService from './services/IAPService';
import LightningPassService from './services/LightningPassService';

// Hooks
import { useGameState } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';

// Styles
import { globalStyles } from './styles/globalStyles';

// Constants
import { GAME_CONFIG, SCORING, ANIMATIONS } from './utils/constants';

/**
 * IntegratedApp - Main application with all new features integrated
 */
export default function IntegratedApp() {
  const [appState, setAppState] = useState({
    phase: 'initializing',
    integrationService: null,
    fontLoaded: false,
    currentScreen: 'start',
    showDebugger: false,
    showStore: false,
    showLightningPass: false,
    showAchievements: false,
    showRewards: false,
    showGameModes: false,
    showGameModeResults: false,
    currentGameMode: null,
    currentGameModeInstance: null,
    recentAchievements: [],
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
    loadFonts();
  }, []);

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
   * Handle initialization completion
   */
  const handleInitializationComplete = (integrationService) => {
    console.log('App initialization completed');
    setAppState(prev => ({
      ...prev,
      phase: 'ready',
      integrationService: integrationService
    }));

    // Load user stats from services
    loadUserStats(integrationService);
  };

  /**
   * Handle initialization error
   */
  const handleInitializationError = (error) => {
    console.error('App initialization failed:', error);
    Alert.alert(
      'Initialization Error',
      'Failed to initialize the app. Some features may not be available.',
      [{ text: 'OK' }]
    );
    setAppState(prev => ({ ...prev, phase: 'ready' }));
  };

  /**
   * Load user stats from services
   */
  const loadUserStats = async (integrationService) => {
    try {
      const achievementService = integrationService.getService('achievement');
      const rewardService = integrationService.getService('reward');
      const iapService = integrationService.getService('iap');
      const lightningPassService = integrationService.getService('lightningPass');

      // Load user stats from AsyncStorage
      const coins = await loadFromStorage('user_coins', 1000);
      const hints = await loadFromStorage('user_hints', 5);
      const lives = await loadFromStorage('user_lives', 3);
      const level = await loadFromStorage('user_level', 1);
      const xp = await loadFromStorage('user_xp', 0);

      setAppState(prev => ({
        ...prev,
        userStats: { coins, hints, lives, level, xp }
      }));

      // Check for recent achievements
      if (achievementService) {
        const recentAchievements = achievementService.getRecentAchievements(3);
        setAppState(prev => ({ ...prev, recentAchievements }));
      }

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
   * Start game with selected mode
   */
  const startGame = async (modeId = 'SINGLE') => {
    try {
      const integrationService = appState.integrationService;
      if (!integrationService) {
        console.error('Integration service not available');
        return;
      }

      const gameModeService = integrationService.getService('gameMode');
      const achievementService = integrationService.getService('achievement');
      const analyticsService = integrationService.getService('analytics');

      // Initialize game mode
      let modeInstance = null;
      if (modeId !== 'SINGLE') {
        modeInstance = gameModeService.getModeInstance(modeId);
        if (modeInstance) {
          await modeInstance.initialize();
        }
      }

      // Track game start
      if (analyticsService) {
        analyticsService.trackGameStart(modeId, 'normal');
      }

      // Start the game
      gameState.startGame();
      setAppState(prev => ({
        ...prev,
        currentScreen: 'game',
        currentGameMode: modeId,
        currentGameModeInstance: modeInstance
      }));

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
      const integrationService = appState.integrationService;
      if (!integrationService) {
        return;
      }

      const gameModeService = integrationService.getService('gameMode');
      const achievementService = integrationService.getService('achievement');
      const analyticsService = integrationService.getService('analytics');

      // End game mode if active
      if (appState.currentGameModeInstance) {
        const gameData = await appState.currentGameModeInstance.endGame();
        setAppState(prev => ({
          ...prev,
          showGameModeResults: true,
          gameModeResults: gameData
        }));
      }

      // Track game end
      if (analyticsService) {
        analyticsService.trackGameEnd(
          appState.currentGameMode || 'SINGLE',
          gameState.score,
          timer.getTimePlayed(),
          gameState.solved
        );
      }

      // Check for new achievements
      if (achievementService) {
        const gameData = {
          finalScore: gameState.score,
          puzzlesCompleted: gameState.solved,
          timePlayed: timer.getTimePlayed(),
          bestStreak: gameState.streak
        };

        const newAchievements = await achievementService.checkForNewAchievements(gameData);
        
        if (newAchievements.length > 0) {
          setAppState(prev => ({
            ...prev,
            recentAchievements: newAchievements
          }));
        }
      }

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
            onStartGame={() => startGame()}
            onShowRules={() => gameState.toggleRules()}
            onShowStore={() => setAppState(prev => ({ ...prev, showStore: true }))}
            onShowAchievements={() => setAppState(prev => ({ ...prev, showAchievements: true }))}
            onShowRewards={() => setAppState(prev => ({ ...prev, showRewards: true }))}
            onShowGameModes={() => setAppState(prev => ({ ...prev, showGameModes: true }))}
          />
        );

      case 'game':
        return (
          <View style={globalStyles.fullScreenContainer}>
            {appState.currentGameModeInstance && (
              <GameModeUI 
                modeInstance={appState.currentGameModeInstance}
                modeConfig={GameModeService.getGameMode(appState.currentGameMode)}
              />
            )}
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
          </View>
        );

      case 'gameOver':
        return (
          <GameOverScreen 
            gameState={gameState} 
            onPlayAgain={() => startGame(appState.currentGameMode)} 
            onShowStore={() => setAppState(prev => ({ ...prev, showStore: true }))}
            onShowAchievements={() => setAppState(prev => ({ ...prev, showAchievements: true }))}
          />
        );

      default:
        return (
          <StartScreen 
            gameState={gameState}
            onStartGame={() => startGame()}
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
        {/* Achievement Notifications */}
        {appState.recentAchievements.map((achievement, index) => (
          <AchievementNotification
            key={index}
            achievement={achievement}
            visible={true}
            onDismiss={() => {
              setAppState(prev => ({
                ...prev,
                recentAchievements: prev.recentAchievements.filter((_, i) => i !== index)
              }));
            }}
          />
        ))}

        {/* Store Screen */}
        {appState.showStore && (
          <StoreScreen
            onBack={() => setAppState(prev => ({ ...prev, showStore: false }))}
            userCoins={appState.userStats.coins}
            userHints={appState.userStats.hints}
            userLives={appState.userStats.lives}
          />
        )}

        {/* Lightning Pass Screen */}
        {appState.showLightningPass && (
          <LightningPassScreen
            onBack={() => setAppState(prev => ({ ...prev, showLightningPass: false }))}
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
            onModeSelect={(mode, modeInstance) => {
              setAppState(prev => ({ ...prev, showGameModes: false }));
              startGame(mode.id);
            }}
            playerLevel={appState.userStats.level}
            playerStats={{}}
          />
        )}

        {/* Game Mode Results */}
        {appState.showGameModeResults && appState.gameModeResults && (
          <GameModeResults
            gameData={appState.gameModeResults}
            modeConfig={GameModeService.getGameMode(appState.currentGameMode)}
            onPlayAgain={() => {
              setAppState(prev => ({ ...prev, showGameModeResults: false }));
              startGame(appState.currentGameMode);
            }}
            onBackToModes={() => setAppState(prev => ({ 
              ...prev, 
              showGameModeResults: false,
              showGameModes: true 
            }))}
            onMainMenu={() => setAppState(prev => ({ 
              ...prev, 
              showGameModeResults: false,
              currentScreen: 'start' 
            }))}
          />
        )}

        {/* Feature Flag Debugger */}
        {appState.showDebugger && (
          <FeatureFlagDebugger
            onBack={() => setAppState(prev => ({ ...prev, showDebugger: false }))}
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

  // Show initialization screen
  if (appState.phase === 'initializing' || !appState.fontLoaded) {
    return (
      <SafeAreaProvider>
        <AppInitializer
          onInitializationComplete={handleInitializationComplete}
          onInitializationError={handleInitializationError}
        />
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
