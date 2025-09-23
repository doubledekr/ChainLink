import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { Animated } from 'react-native';

// Components
import GameScreen from './components/screens/GameScreen';
import StartScreen from './components/screens/StartScreen';
import GameOverScreen from './components/screens/GameOverScreen';
import RulesScreen from './components/screens/RulesScreen';

// Hooks
import { useGameState } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';

// Services
import WordService from './services/WordService';

// Styles
import { globalStyles } from './styles/globalStyles';

// External components
import MultiplayerManager from '../MultiplayerManager';
import { MultiplayerChainLink } from '../MultiplayerComponents';

// Constants
import { GAME_CONFIG, SCORING, ANIMATIONS } from './utils/constants';

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const gameState = useGameState();
  
  // Animation refs
  const confirmAnim = useRef(new Animated.Value(1)).current;
  const keyPressAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  const successMessageAnim = useRef(new Animated.Value(0)).current;

  // Initialize app
  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'Bodoni Moda': require('../assets/fonts/BodoniModa-Italic-VariableFont_opsz,wght.ttf'),
      });
      setFontLoaded(true);
    };
    loadFont();
    
    // Initialize multiplayer
    const initMultiplayer = async () => {
      try {
        const success = await MultiplayerManager.initialize();
        gameState.setMultiplayerInitializedState(success);
        console.log('🎮 Multiplayer initialized:', success);
      } catch (error) {
        console.error('❌ Multiplayer initialization failed:', error);
        gameState.setMultiplayerInitializedState(false);
      }
    };
    initMultiplayer();
  }, []);

  // Timer hook with timeout callback
  const timer = useTimer(() => {
    handleTimeOut();
  });

  // Animation functions
  const confirmSuccess = () => {
    Animated.sequence([
      Animated.timing(confirmAnim, { 
        toValue: 1.2, 
        duration: ANIMATIONS.CONFIRM_ANIMATION_DURATION, 
        useNativeDriver: true 
      }),
      Animated.timing(confirmAnim, { 
        toValue: 1, 
        duration: ANIMATIONS.CONFIRM_ANIMATION_DURATION, 
        useNativeDriver: true 
      })
    ]).start();
  };

  const animateSuccessMessage = (points) => {
    successMessageAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(successMessageAnim, {
        toValue: 1,
        duration: ANIMATIONS.SUCCESS_MESSAGE_DURATION,
        useNativeDriver: true,
      }),
      Animated.delay(ANIMATIONS.SUCCESS_MESSAGE_HOLD),
      Animated.timing(successMessageAnim, {
        toValue: 0,
        duration: ANIMATIONS.SUCCESS_MESSAGE_DURATION,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateKeyPress = (letter) => {
    gameState.setKeyPressedState(letter);
    Animated.sequence([
      Animated.timing(keyPressAnim, { 
        toValue: 0.95, 
        duration: ANIMATIONS.KEY_PRESS_DURATION, 
        useNativeDriver: true 
      }),
      Animated.timing(keyPressAnim, { 
        toValue: 1, 
        duration: ANIMATIONS.KEY_PRESS_DURATION, 
        useNativeDriver: true 
      })
    ]).start(() => {
      gameState.setKeyPressedState(null);
    });
  };

  // Game logic functions
  const startGame = async () => {
    console.log('🎮 Starting new game - initial roundsRemaining:', gameState.roundsRemaining);
    gameState.startGame();
    console.log('🎮 After startGame() - roundsRemaining:', gameState.roundsRemaining);
    
    // Generate initial puzzle
    console.log('🎮 Generating initial puzzle...');
    const puzzleData = await WordService.generateFreshPuzzle();
    console.log('🎮 Initial puzzle:', puzzleData);
    
    gameState.updateWords(puzzleData.start, puzzleData.end);
    
    // Start timer
    const newTime = timer.calculateTimerDuration(gameState.level);
    timer.startTimer(newTime);
  };

  const handleTimeOut = async () => {
    console.log('⏰ ========== TIMEOUT FUNCTION CALLED ==========');
    console.log('⏰ gameActive (ref):', gameState.gameActiveRef.current);
    console.log('⏰ bonusRounds:', gameState.bonusRounds);
    console.log('⏰ roundsRemaining:', gameState.roundsRemaining);
    
    gameState.resetStreak();
    gameState.setErrorState(null);
    
    // If in bonus rounds, end game on timeout
    if (gameState.bonusRounds) {
      console.log('⏰ Ending game - in bonus rounds');
      gameState.endGame();
      return;
    }
    
    // Otherwise chain to next puzzle when time expires
    if (gameState.gameActiveRef.current) {
      console.log('⏰ Game active (via ref) - calling nextPuzzle() with timeout (no correct answer)');
      try {
        await nextPuzzle(null);
        console.log('⏰ nextPuzzle() completed successfully');
      } catch (error) {
        console.error('⏰ Error in nextPuzzle():', error);
      }
    } else {
      console.log('⏰ Game NOT active (via ref) - not calling nextPuzzle()');
    }
  };

  const nextPuzzle = async (correctAnswer = null) => {
    console.log('🎮 nextPuzzle called with correctAnswer:', correctAnswer);
    console.log('🎮 Current gameState.roundsRemaining:', gameState.roundsRemaining);
    
    gameState.setCurrentPuzzle(prev => prev + 1);
    
    // Update rounds - use current value to determine next state
    const currentRounds = gameState.roundsRemaining;
    console.log('🎮 Using currentRounds for logic:', currentRounds);
    
    if (currentRounds > 1) {
      console.log('🎮 Decreasing rounds remaining from', currentRounds, 'to', currentRounds - 1);
      gameState.setRoundsRemaining(currentRounds - 1);
    } else if (currentRounds === 1) {
      if (correctAnswer && !gameState.bonusRounds) {
        console.log('🎮 Entering bonus rounds - user got perfect answer on final round');
        gameState.setBonusRounds(true);
        gameState.setRoundsRemaining(0);
      } else {
        console.log('🎮 Game should end - 10 rounds completed without perfect streak');
        gameState.endGame();
        return;
      }
    } else if (currentRounds <= 0) {
      if (gameState.bonusRounds) {
        if (correctAnswer) {
          console.log('🎮 Bonus round continues - correct answer');
        } else {
          console.log('🎮 Bonus round ends - wrong answer or timeout');
          gameState.endGame();
          return;
        }
      } else {
        console.log('🎮 ERROR: Negative rounds without bonus - ending game');
        gameState.endGame();
        return;
      }
    }
    
    // Get new words for chaining
    const newStartWords = await WordService.fetchWordsForChaining(1, gameState.solved, [gameState.startWord, gameState.endWord]);
    const chainedStartWord = newStartWords[0];
    let chainedEndWord;
    
    if (correctAnswer) {
      chainedEndWord = correctAnswer;
      console.log('🎮 User answered correctly - their answer becomes end word:', correctAnswer);
    } else {
      chainedEndWord = gameState.currentStartWordRef.current;
      console.log('🎮 Time expired - start word becomes end word:', gameState.currentStartWordRef.current);
    }
    
    console.log('🎮 NEW WORD CHAIN WILL BE:', chainedStartWord, '→', chainedEndWord);
    
    gameState.updateWords(chainedStartWord, chainedEndWord);
    
    // Reset timer with new duration
    const newTime = timer.calculateTimerDuration(gameState.level);
    timer.startTimer(newTime);
  };

  const handleSubmit = async () => {
    const word = gameState.currentWord.trim().toUpperCase();
    
    if (!gameState.gameActive) return;
    
    // Must be exactly 5 letters
    if (word.length !== 5) {
      gameState.setErrorState('invalid');
      setTimeout(() => {
        gameState.updateCurrentWord('');
        gameState.setErrorState(null);
      }, 1000);
      return;
    }

    // Cannot use start or end words as answer
    if (word === gameState.startWord.toUpperCase() || word === gameState.endWord.toUpperCase()) {
      gameState.setErrorState('invalid');
      setTimeout(() => {
        gameState.updateCurrentWord('');
        gameState.setErrorState(null);
      }, 1000);
      return;
    }

    // Validate word with API and letter sharing rules
    const isValidBridge = await WordService.validateBridgeWord(word, gameState.startWord, gameState.endWord);
    
    if (isValidBridge) {
      // SUCCESS!
      timer.stopTimer();
      
      gameState.incrementSolved();
      gameState.incrementStreak();
      
      // Calculate score with updated streak (streak + 1)
      const timeBonus = timer.getTimeBonus();
      const speedBonus = timer.getTimeBasedBonus().bonus;
      const newStreak = gameState.streak + 1;
      const streakMultiplier = Math.min(newStreak, SCORING.MAX_STREAK_MULTIPLIER);
      const levelBonus = gameState.level * SCORING.LEVEL_BONUS_MULTIPLIER;
      const points = (SCORING.BASE_POINTS + timeBonus + speedBonus + levelBonus) * streakMultiplier;
      
      gameState.updateScore(points);
      
      // Show success animation
      gameState.setErrorState('success');
      confirmSuccess();
      animateSuccessMessage(points);
      
      // Show streak animation if new streak >= 3
      if (newStreak >= 3) {
        gameState.setShowStreakState(true);
        Animated.sequence([
          Animated.timing(streakAnim, { 
            toValue: 1, 
            duration: ANIMATIONS.STREAK_ANIMATION_DURATION, 
            useNativeDriver: true 
          }),
          Animated.delay(ANIMATIONS.STREAK_ANIMATION_HOLD),
          Animated.timing(streakAnim, { 
            toValue: 0, 
            duration: ANIMATIONS.STREAK_ANIMATION_DURATION, 
            useNativeDriver: true 
          })
        ]).start(() => gameState.setShowStreakState(false));
      }
      
      // Move to next puzzle after success
      setTimeout(async () => {
        if (gameState.gameActive) {
          await nextPuzzle(word);
        }
      }, 1500);
      
    } else {
      // WRONG ANSWER
      gameState.resetStreak();
      gameState.setErrorState('invalid');
      
      // If in bonus rounds, end game on wrong answer
      if (gameState.bonusRounds) {
        setTimeout(() => {
          gameState.endGame();
        }, 1000);
        return;
      }
      
      setTimeout(() => {
        gameState.updateCurrentWord('');
        gameState.setErrorState(null);
      }, 1000);
    }
  };

  const handleKeyPress = (letter) => {
    animateKeyPress(letter);
    
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

  const skipPuzzle = async () => {
    gameState.updateScore(SCORING.SKIP_PENALTY);
    gameState.resetStreak();
    timer.stopTimer();
    gameState.setErrorState('skipped');
    
    // If in bonus rounds, end game on skip
    if (gameState.bonusRounds) {
      setTimeout(() => {
        gameState.endGame();
      }, 800);
      return;
    }
    
    // Automatically load next puzzle after skip
    setTimeout(async () => {
      if (gameState.gameActive) {
        await nextPuzzle(null);
      }
    }, 800);
  };

  // Render loading screen
  if (!fontLoaded) {
    return (
      <SafeAreaProvider>
        <View style={[globalStyles.fullScreenContainer, globalStyles.centered]}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </SafeAreaProvider>
    );
  }

  // Render current screen
  const renderCurrentScreen = () => {
    if (gameState.showRules) {
      return (
        <RulesScreen 
          gameState={gameState} 
          onClose={() => gameState.toggleRules()} 
        />
      );
    }
    
    if (gameState.showGameOver) {
      return (
        <GameOverScreen 
          gameState={gameState} 
          onPlayAgain={startGame} 
        />
      );
    }
    
    if (gameState.gameActive) {
      return (
        <GameScreen 
          gameState={gameState}
          timer={timer}
          animations={{
            confirmAnim,
            keyPressAnim,
            streakAnim,
            successMessageAnim
          }}
          onKeyPress={handleKeyPress}
          onSkipPuzzle={skipPuzzle}
          onShowRules={() => gameState.toggleRules()}
        />
      );
    }
    
    return (
      <StartScreen 
        gameState={gameState}
        onStartGame={startGame}
        onShowRules={() => gameState.toggleRules()}
        onMultiplayerMode={() => gameState.setGameModeState('multiplayer')}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <View style={globalStyles.fullScreenContainer}>
        <SafeAreaView style={globalStyles.container}>
          {renderCurrentScreen()}
        </SafeAreaView>
      </View>
      
      {/* Multiplayer Mode */}
      {gameState.gameMode === 'multiplayer' && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={true}
          onRequestClose={() => gameState.setGameModeState('single')}
        >
          <MultiplayerChainLink
            onBackToMenu={() => gameState.setGameModeState('single')}
            multiplayerManager={MultiplayerManager}
          />
        </Modal>
      )}
    </SafeAreaProvider>
  );
}
