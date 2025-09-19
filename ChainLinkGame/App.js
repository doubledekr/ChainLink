import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Text, ActivityIndicator, Modal, ImageBackground, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { 
  CustomButton, 
  CircleButton, 
  CloseButton,
  Panel, 
  CustomProgressBar, 
  CustomTextBox,
  KeyboardKey,
  RatingStars,
  TabButton
} from './CustomUIComponents';
import { Images } from './ImageAssets';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

// Common 5-letter words for fallback when API fails
const fallbackWords = [
  "TOWER", "BEACH", "WATER", "REACH", "HEART", "SPACE", "EARTH", "CHART",
  "STORM", "PEACE", "CREAM", "STEAM", "MAGIC", "TRUTH", "MATCH", "TEACH",
  "BRAVE", "SMILE", "BLAME", "SCALE", "DREAM", "WORLD", "BREAD", "TREND",
  "MUSIC", "DANCE", "SONIC", "PANIC", "OCEAN", "FLAME", "CLEAN", "PLANE",
  "CROWN", "LIGHT", "CLOWN", "GROWN", "PLANT", "STONE", "PLATE", "SLANT",
  "HOUSE", "RIVER", "HORSE", "HOVER", "CHAIR", "TABLE", "CABLE", "CHASE",
  "PHONE", "PAPER", "PHASE", "PLACE", "CLOUD", "TRACE", "CLOTH", "CLEAR"
];

export default function App() {
  // Font loading
  const [fontLoaded, setFontLoaded] = useState(false);
  
  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'Bodoni Moda': require('./assets/fonts/BodoniModa-Italic-VariableFont_opsz,wght.ttf'),
      });
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [startWord, setStartWord] = useState('TOWER');
  const [endWord, setEndWord] = useState('BEACH');
  const [currentWord, setCurrentWord] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [initialTime, setInitialTime] = useState(30);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [roundsRemaining, setRoundsRemaining] = useState(10);
  const [bonusRounds, setBonusRounds] = useState(false); // True when past 10 rounds
  const [showGameOver, setShowGameOver] = useState(false);
  
  // UI state
  const [error, setError] = useState(null);
  const [keyPressed, setKeyPressed] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  
  // Animations
  const confirmAnim = useRef(new Animated.Value(1)).current;
  const keyPressAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  const successMessageAnim = useRef(new Animated.Value(0)).current;
  
  // Timers
  const timerInterval = useRef(null);
  const gameTimer = useRef(null);
  
  // Refs to store current words for timer callbacks
  const currentStartWordRef = useRef('');
  const currentEndWordRef = useRef('');
  const gameActiveRef = useRef(false);

  const checkWord = async (word) => {
    try {
      console.log(`🌐 Making API call for word: ${word}`);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      console.log(`📡 API response status: ${response.status}`);
      if (!response.ok) {
        console.log(`❌ Word "${word}" not found in dictionary`);
        return false;
      }
      console.log(`✅ Word "${word}" is valid`);
      return true;
    } catch (err) {
      console.log(`🚨 API error for "${word}":`, err);
      return false;
    }
  };

  const fetchRandomWords = async (count = 2) => {
    try {
      console.log(`🎲 Fetching ${count} random words from API`);
      // Using a word list API to get random 5-letter words
      const response = await fetch('https://random-words-api.vercel.app/word');
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      const words = [];
      
      // Try to get valid 5-letter words
      for (let i = 0; i < count * 5; i++) { // Try multiple times to get good words
        const wordResponse = await fetch('https://random-words-api.vercel.app/word');
        if (wordResponse.ok) {
          const wordData = await wordResponse.json();
          const word = wordData[0]?.word?.toUpperCase();
          if (word && word.length === 5 && /^[A-Z]+$/.test(word)) {
            words.push(word);
            if (words.length >= count) break;
          }
        }
      }
      
      if (words.length < count) {
        console.log('⚠️ Not enough words from API, using fallback');
        // Fill with fallback words if needed
        const shuffledFallback = [...fallbackWords].sort(() => Math.random() - 0.5);
        while (words.length < count) {
          words.push(shuffledFallback[words.length % shuffledFallback.length]);
        }
      }
      
      console.log(`✅ Got words: ${words.join(', ')}`);
      return words;
    } catch (err) {
      console.log(`🚨 Error fetching random words:`, err);
      // Fallback to random words from our list
      const shuffled = [...fallbackWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
  };

  const generateFreshPuzzle = async () => {
    try {
      console.log('🎮 Generating fresh puzzle...');
      const words = await fetchRandomWords(2);
      const startWord = words[0];
      const endWord = words[1];
      
      console.log(`🎯 New puzzle: ${startWord} → ${endWord}`);
      return { start: startWord, end: endWord };
    } catch (err) {
      console.log('🚨 Error generating puzzle, using fallback');
      const shuffled = [...fallbackWords].sort(() => Math.random() - 0.5);
      return { start: shuffled[0], end: shuffled[1] };
    }
  };

  const getSharedLetters = (word1, word2) => {
    const letters1 = word1.toLowerCase().split('');
    const letters2 = word2.toLowerCase().split('');
    
    // Count frequency of each letter in both words
    const freq1 = {};
    const freq2 = {};
    
    letters1.forEach(letter => freq1[letter] = (freq1[letter] || 0) + 1);
    letters2.forEach(letter => freq2[letter] = (freq2[letter] || 0) + 1);
    
    // Count shared letters (minimum of frequencies)
    let sharedCount = 0;
    for (const letter in freq1) {
      if (freq2[letter]) {
        sharedCount += Math.min(freq1[letter], freq2[letter]);
      }
    }
    
    return sharedCount;
  };

  const validateBridgeWord = async (word, startWord, endWord) => {
    console.log(`🔍 Validating bridge word: ${word} between ${startWord} and ${endWord}`);
    
    // First check if it's a valid English word
    const isValidWord = await checkWord(word);
    if (!isValidWord) {
      console.log(`❌ "${word}" is not a valid English word`);
      return false;
    }
    
    // Then check if it bridges the two words (shares ≥2 letters with both)
    const sharedWithStart = getSharedLetters(word, startWord);
    const sharedWithEnd = getSharedLetters(word, endWord);
    
    console.log(`📊 Letter sharing: ${word} shares ${sharedWithStart} with ${startWord}, ${sharedWithEnd} with ${endWord}`);
    
    if (sharedWithStart >= 2 && sharedWithEnd >= 2) {
      console.log(`✅ "${word}" is a valid bridge word!`);
      return true;
    } else {
      console.log(`❌ "${word}" doesn't share enough letters`);
      return false;
    }
  };

  const startGame = async () => {
    console.log('🎮 Starting game - setting gameActive to true');
    setGameActive(true);
    gameActiveRef.current = true;
    setScore(0);
    setStreak(0);
    setSolved(0);
    setLevel(1);
    setCurrentPuzzle(0);
    setRoundsRemaining(10);
    setBonusRounds(false);
    setShowGameOver(false);
    
    // Generate initial two words for the game
    console.log('🎮 Generating initial puzzle...');
    const puzzleData = await generateFreshPuzzle();
    console.log('🎮 Initial puzzle:', puzzleData);
    setStartWord(puzzleData.start);
    setEndWord(puzzleData.end);
    setCurrentWord('');
    setError(null);
    
    // Update refs for timer callbacks
    currentStartWordRef.current = puzzleData.start;
    currentEndWordRef.current = puzzleData.end;
    
    console.log('🎮 FIRST ROUND - Set refs to:', currentStartWordRef.current, '→', currentEndWordRef.current);
    
    // Start timer immediately
    const newTime = Math.max(15, 30 - Math.floor(1 / 3)); // Level 1 time (30s)
    setTimeRemaining(newTime);
    setInitialTime(newTime);
    
    console.log('🎮 Starting timer with', newTime, 'seconds');
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          console.log('⏰ TIMER EXPIRED IN STARTGAME! Calling timeOut()');
          console.log('⏰ Refs contain:', currentStartWordRef.current, '→', currentEndWordRef.current);
          // Clear the timer immediately to prevent multiple calls
          clearInterval(timerInterval.current);
          // Use setTimeout to break out of the setInterval callback context
          setTimeout(() => {
            timeOut(currentStartWordRef.current, currentEndWordRef.current).catch(err => console.error('Error in timeOut:', err));
          }, 0);
          return 0;
        }
        return newTime;
      });
    }, 100);
  };

  const endGame = () => {
    console.log('🎮 Ending game - setting gameActive to false');
    setGameActive(false);
    gameActiveRef.current = false;
    clearInterval(timerInterval.current);
    clearInterval(gameTimer.current);
    setShowGameOver(true);
  };

  const nextPuzzle = async (correctAnswer = null, currentStartWord = null, currentEndWord = null) => {
    console.log('🎮 nextPuzzle called with:');
    console.log('   - correctAnswer:', correctAnswer);
    console.log('   - currentStartWord:', currentStartWord);
    console.log('   - currentEndWord:', currentEndWord);
    console.log('   - currentPuzzle:', currentPuzzle);
    console.log('   - roundsRemaining:', roundsRemaining);
    console.log('   - bonusRounds:', bonusRounds);
    
    // Use passed words or fall back to state (for correct answers)
    const wordToChainFrom = currentStartWord || startWord;
    const currentEnd = currentEndWord || endWord;
    
    const newPuzzleIndex = currentPuzzle + 1;
    setCurrentPuzzle(newPuzzleIndex);
    
    // Update rounds - decrease remaining rounds
    if (roundsRemaining > 1) {
      console.log('🎮 Decreasing rounds remaining from', roundsRemaining, 'to', roundsRemaining - 1);
      setRoundsRemaining(prev => prev - 1);
    } else if (roundsRemaining === 1) {
      // Check if this should be bonus rounds (only if user got correct answer)
      if (correctAnswer && !bonusRounds) {
        console.log('🎮 Entering bonus rounds - user got answer correct');
        setBonusRounds(true);
        setRoundsRemaining(0);
      } else {
        // End the game - either timeout on round 1, or already in bonus
        console.log('🎮 Game should end - rounds completed');
        endGame();
        return;
      }
    } else if (roundsRemaining <= 0) {
      // Already at 0 or negative - something went wrong, end game
      console.log('🎮 Rounds already at/below 0 - ending game');
      endGame();
      return;
    }
    
    // Chain words based on whether user got answer correct or time ran out
    console.log('🎮 About to fetch new start word...');
    const newStartWords = await fetchRandomWords(1);
    const chainedStartWord = newStartWords[0];
    let chainedEndWord;
    
    console.log('🎮 Current state before chaining:');
    console.log('   - wordToChainFrom (start):', wordToChainFrom);
    console.log('   - currentEnd:', currentEnd);
    console.log('   - correctAnswer:', correctAnswer);
    
    if (correctAnswer) {
      // User got answer correct: their answer becomes the end word
      chainedEndWord = correctAnswer;
      console.log('🎮 User answered correctly - their answer becomes end word:', correctAnswer);
    } else {
      // Time ran out: start word becomes end word
      chainedEndWord = wordToChainFrom;
      console.log('🎮 Time expired - start word becomes end word:', wordToChainFrom);
    }
    
    console.log('🎮 NEW WORD CHAIN WILL BE:', chainedStartWord, '→', chainedEndWord);
    console.log('🎮 BEFORE SETTING - Current UI shows:', startWord, '→', endWord);
    console.log('🎮 SETTING NEW WORDS NOW...');
    
    // Set the new words directly
    setStartWord(chainedStartWord);
    setEndWord(chainedEndWord);
    setCurrentWord('');
    setError(null);
    
    // Update refs for timer callbacks
    currentStartWordRef.current = chainedStartWord;
    currentEndWordRef.current = chainedEndWord;
    
    console.log('🎮 ✅ WORDS SET - New chain should be:', chainedStartWord, '→', chainedEndWord);
    console.log('🎮 Expected: TOP =', chainedStartWord, ', BOTTOM =', chainedEndWord);
    
    // Force a small delay to ensure state updates
    setTimeout(() => {
      console.log('🎮 VERIFICATION - Current words should now be:', chainedStartWord, '→', chainedEndWord);
    }, 100);
    
    // Reset timer - gets faster as level increases (instant)
    const newTime = Math.max(15, 30 - Math.floor(level / 3));
    
    // Clear any existing timer first
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Set timer state
    setTimeRemaining(newTime);
    setInitialTime(newTime);
    
    // Start new timer after a small delay to ensure state updates
    setTimeout(() => {
      console.log('🎮 Starting next puzzle timer with', newTime, 'seconds');
      timerInterval.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
          console.log('⏰ TIMER EXPIRED IN NEXTPUZZLE! Calling timeOut()');
          // Clear the timer immediately to prevent multiple calls
          clearInterval(timerInterval.current);
          // Use setTimeout to break out of the setInterval callback context
          setTimeout(() => {
            timeOut(currentStartWordRef.current, currentEndWordRef.current).catch(err => console.error('Error in timeOut:', err));
          }, 0);
            return 0;
          }
          return newTime;
        });
      }, 100);
    }, 50);
  };

  const timeOut = async (currentStartWord, currentEndWord) => {
    console.log('⏰ ========== TIMEOUT FUNCTION CALLED ==========');
    console.log('⏰ gameActive (state):', gameActive);
    console.log('⏰ gameActiveRef (ref):', gameActiveRef.current);
    console.log('⏰ bonusRounds:', bonusRounds);
    console.log('⏰ roundsRemaining:', roundsRemaining);
    console.log('⏰ currentStartWord (should become END):', currentStartWord);
    console.log('⏰ currentEndWord (will be replaced):', currentEndWord);
    console.log('⏰ Expected: NEW_WORD →', currentStartWord);
    
    clearInterval(timerInterval.current);
    setStreak(0);
    setError(null);
    
    // If in bonus rounds, end game on timeout
    if (bonusRounds) {
      console.log('⏰ Ending game - in bonus rounds');
      endGame();
      return;
    }
    
    // Otherwise chain to next puzzle when time expires - use ref for current value
    if (gameActiveRef.current) {
      console.log('⏰ Game active (via ref) - calling nextPuzzle() with timeout (no correct answer)');
      try {
        await nextPuzzle(null, currentStartWord, currentEndWord);
        console.log('⏰ nextPuzzle() completed successfully');
      } catch (error) {
        console.error('⏰ Error in nextPuzzle():', error);
      }
    } else {
      console.log('⏰ Game NOT active (via ref) - not calling nextPuzzle()');
    }
    console.log('⏰ ========== TIMEOUT FUNCTION FINISHED ==========');
  };

  const skipPuzzle = async () => {
    setScore(prev => Math.max(0, prev - 50));
    setStreak(0);
    clearInterval(timerInterval.current);
    setError('skipped');
    
    // If in bonus rounds, end game on skip
    if (bonusRounds) {
      setTimeout(() => {
        endGame();
      }, 800);
      return;
    }
    
    // Automatically load next puzzle after skip
    setTimeout(async () => {
      if (gameActive) {
        await nextPuzzle(null, currentStartWordRef.current, currentEndWordRef.current); // Pass current words for chaining
      }
    }, 800); // Fast transition for skip
  };


  const confirmSuccess = () => {
    Animated.sequence([
      Animated.timing(confirmAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(confirmAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const animateSuccessMessage = (points) => {
    // Reset animations
    successMessageAnim.setValue(0);
    
    // Animate success message: fade in and up, then fade out
    Animated.sequence([
      // Fade in and move up
      Animated.timing(successMessageAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Hold visible
      Animated.delay(1200),
      // Fade out
      Animated.timing(successMessageAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleSubmit = async () => {
    const word = currentWord.trim().toUpperCase();
    
    if (!gameActive) return;
    
    // Must be exactly 5 letters
    if (word.length !== 5) {
      setError('invalid');
      setTimeout(() => {
        setCurrentWord('');
        setError(null);
      }, 1000);
      return;
    }

    // Cannot use start or end words as answer
    if (word === startWord.toUpperCase() || word === endWord.toUpperCase()) {
      setError('invalid');
      setTimeout(() => {
        setCurrentWord('');
        setError(null);
      }, 1000);
      return;
    }

    // Validate word with API and letter sharing rules
    const isValidBridge = await validateBridgeWord(word, startWord, endWord);
    
    if (isValidBridge) {
      // SUCCESS! (Instant response)
      clearInterval(timerInterval.current);
      
      const newSolved = solved + 1;
      const newStreak = streak + 1;
      
      setSolved(newSolved);
      setStreak(newStreak);
      
      // Calculate score with enhanced time-based multipliers
      const timeBonus = timeRemaining * 10;
      const speedBonus = timeRemaining > (initialTime * 0.8) ? 100 : // Super fast (80%+ time left)
                        timeRemaining > (initialTime * 0.6) ? 50 :  // Fast (60%+ time left)
                        timeRemaining > (initialTime * 0.4) ? 25 :  // Medium (40%+ time left)
                        0; // Slow
      const streakMultiplier = Math.min(newStreak, 10);
      const levelBonus = level * 5;
      const points = (100 + timeBonus + speedBonus + levelBonus) * streakMultiplier;
      
      setScore(prev => prev + points);
      
      // Level up every 5 solves
      if (newSolved % 5 === 0) {
        setLevel(prev => prev + 1);
      }
      
      // Show success animation
      setError('success');
      confirmSuccess();
      animateSuccessMessage(points);
      
      // Show streak animation if streak >= 3
      if (newStreak >= 3) {
        setShowStreak(true);
        Animated.sequence([
          Animated.timing(streakAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(1500),
          Animated.timing(streakAnim, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start(() => setShowStreak(false));
      }
      
      // Move to next puzzle after success (using chaining logic)
      setTimeout(async () => {
        if (gameActive) {
          await nextPuzzle(word); // Pass the correct answer to chain properly
        }
      }, 1500);
      
    } else {
      // WRONG ANSWER (Instant response)
      setStreak(0);
      setError('invalid');
      
      // If in bonus rounds, end game on wrong answer
      if (bonusRounds) {
        setTimeout(() => {
          endGame();
        }, 1000);
        return;
      }
      
      setTimeout(() => {
        setCurrentWord('');
        setError(null);
      }, 1000);
    }
  };

  const animateKeyPress = (letter) => {
    setKeyPressed(letter);
    Animated.sequence([
      Animated.timing(keyPressAnim, { toValue: 0.95, duration: 25, useNativeDriver: true }),
      Animated.timing(keyPressAnim, { toValue: 1, duration: 25, useNativeDriver: true })
    ]).start(() => {
      setKeyPressed(null);
    });
  };

  const handleKeyPress = (letter) => {
    // Animate the key press
    animateKeyPress(letter);
    
    if (letter === 'BACKSPACE') {
      setCurrentWord(currentWord.slice(0, -1));
    } else if (letter === 'ENTER') {
      if (currentWord.trim().length === 5) {
        handleSubmit();
      }
    } else {
      // Limit word length to 5 characters
      if (currentWord.length < 5) {
        setCurrentWord(currentWord + letter);
      }
    }
  };

  const renderLetterTiles = (word, isInput = false, isEmpty = false) => {
    if (isEmpty) {
      return (
        <View style={styles.wordContainer}>
          <View style={styles.letterRow}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View key={`empty-${index}`} style={styles.emptyLetterTile}>
                <Text style={styles.emptyLetterText}>_</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // Ensure exactly 5 slots for 5-letter words
    const letters = word.split('');
    const paddedLetters = [...letters];
    while (paddedLetters.length < 5) {
      paddedLetters.push('');
    }

    return (
      <View style={styles.wordContainer}>
        <View style={styles.letterRow}>
          {paddedLetters.slice(0, 5).map((letter, index) => (
            <Animated.View 
              key={`${word}-${index}`} 
              style={[
                letter ? styles.letterTile : styles.emptyLetterTile,
                isInput && error === 'invalid' && letter && { 
                  backgroundColor: '#ff6b6b',
                  borderColor: '#ff0000'
                },
                isInput && error === 'success' && letter && {
                  transform: [{ scale: confirmAnim }],
                  backgroundColor: '#4CAF50',
                  borderColor: '#2E7D32'
                }
              ]}
            >
              <Text style={[
                letter ? styles.letterText : styles.emptyLetterText,
                isInput && error === 'success' && letter && { color: 'white' }
              ]}>
                {letter || '_'}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  if (!fontLoaded) {
    return (
      <SafeAreaProvider>
        <View style={[styles.fullScreenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.fullScreenContainer}>
        <SafeAreaView style={styles.container}>
          <View style={styles.gameBoard}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              onPress={() => setShowRules(true)}
              activeOpacity={0.7}
              style={styles.rulesButton}
            >
              <Text style={styles.rulesButtonText}>?</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{score.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{solved}</Text>
              <Text style={styles.statLabel}>Solved</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {bonusRounds ? 'BONUS' : roundsRemaining}
              </Text>
              <Text style={styles.statLabel}>
                {bonusRounds ? 'Round' : 'Left'}
              </Text>
            </View>
          </View>

          {/* Timer with Progress Bar */}
          <View style={styles.timerContainer}>
            {gameActive ? (
              <>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${(timeRemaining / initialTime) * 100}%` }
                  ]} />
                </View>
                
                {/* Speed Bonus Indicator */}
                <View style={styles.speedBonusContainer}>
                  {timeRemaining > (initialTime * 0.8) && (
                    <Text style={styles.speedBonusText}>SUPER FAST +100</Text>
                  )}
                  {timeRemaining <= (initialTime * 0.8) && timeRemaining > (initialTime * 0.6) && (
                    <Text style={styles.speedBonusText}>FAST +50</Text>
                  )}
                  {timeRemaining <= (initialTime * 0.6) && timeRemaining > (initialTime * 0.4) && (
                    <Text style={styles.speedBonusText}>MEDIUM +25</Text>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.timerMessageContainer}>
                <Text style={styles.timerMessage}>Ready to start!</Text>
              </View>
            )}
          </View>
          
          {/* Game Words */}
          <View style={styles.puzzleArea}>
            <View style={styles.wordDisplay}>
              {renderLetterTiles(startWord)}
              <View style={styles.inputContainer}>
                {currentWord.length > 0 
                  ? renderLetterTiles(currentWord, true)
                  : renderLetterTiles('', false, true)}
                {showStreak && (
                  <Animated.View style={[styles.streakOverlay, { opacity: streakAnim }]}>
                    <View style={styles.fireEmojiContainer}>
                      <Text style={styles.fireEmoji}>🔥</Text>
                      <Text style={styles.fireEmoji}>🔥</Text>
                      <Text style={styles.fireEmoji}>🔥</Text>
                    </View>
                    <Text style={styles.streakText}>STREAK x{streak}</Text>
                  </Animated.View>
                )}
                
              </View>
              {renderLetterTiles(endWord)}
            </View>
          </View>

        {/* Fixed Height Feedback Area */}
        <View style={styles.feedbackContainer}>
          {gameActive && error === 'invalid' && (
            <View style={styles.feedbackOverlay}>
              <Text style={[styles.feedback, styles.feedbackError]}>
                ❌ Word doesn't bridge both words or isn't valid
              </Text>
            </View>
          )}
          
          {/* Animated Success Message */}
          {gameActive && error === 'success' && (
            <Animated.View style={[
              styles.animatedSuccessContainer,
              {
                opacity: successMessageAnim,
                transform: [
                  {
                    translateY: successMessageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, -30],
                    }),
                  },
                  {
                    scale: successMessageAnim.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0.7, 1.1, 1],
                    }),
                  },
                ],
              },
            ]}>
              <Text style={[styles.feedback, styles.feedbackSuccess]}>
                Perfect! +{((100 + timeRemaining * 10 + (timeRemaining > (initialTime * 0.8) ? 100 : timeRemaining > (initialTime * 0.6) ? 50 : timeRemaining > (initialTime * 0.4) ? 25 : 0) + level * 5) * Math.min(streak, 10)).toLocaleString()} points!
                {timeRemaining > (initialTime * 0.8) && " SUPER FAST BONUS!"}
                {timeRemaining <= (initialTime * 0.8) && timeRemaining > (initialTime * 0.6) && " FAST BONUS!"}
                {timeRemaining <= (initialTime * 0.6) && timeRemaining > (initialTime * 0.4) && " SPEED BONUS!"}
              </Text>
            </Animated.View>
          )}
          
        </View>

        {/* Fixed Height Controls Area */}
        <View style={styles.controlsContainer}>
          {gameActive && (
            <TouchableOpacity 
              style={styles.simpleButton}
              onPress={skipPuzzle}
              activeOpacity={0.8}
            >
              <Text style={styles.simpleButtonText}>Skip (-50 pts)</Text>
            </TouchableOpacity>
          )}
        </View>

          {/* Keyboard */}
          <View style={styles.keyboard}>
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keyboardRow}>
              {rowIndex === 2 && (
                <KeyboardKey
                  letter="ENTER"
                  onPress={handleKeyPress}
                  isSpecial={true}
                  pressed={keyPressed === 'ENTER'}
                  animatedValue={keyPressed === 'ENTER' ? keyPressAnim : null}
                />
              )}
              {row.map((letter) => (
                <KeyboardKey
                  key={letter}
                  letter={letter}
                  onPress={handleKeyPress}
                  pressed={keyPressed === letter}
                  animatedValue={keyPressed === letter ? keyPressAnim : null}
                />
              ))}
              {rowIndex === 2 && (
                <KeyboardKey
                  letter="BACKSPACE"
                  onPress={handleKeyPress}
                  isSpecial={true}
                  pressed={keyPressed === 'BACKSPACE'}
                  animatedValue={keyPressed === 'BACKSPACE' ? keyPressAnim : null}
                />
              )}
              </View>
            ))}
          </View>
        </View>

        {/* Start Game Screen */}
        {!gameActive && !showGameOver && (
          <View style={styles.fullscreenOverlay}>
            <View style={styles.startScreen}>
              <Text style={styles.startTitle}>Lightning Links</Text>
              <Text style={styles.startSubtitle}>Bridge words with lightning speed!</Text>
              
              <View style={styles.startInstructions}>
                <Text style={styles.instructionText}>Complete 10 rounds to finish the game</Text>
                <Text style={styles.instructionText}>Perfect streak? Keep playing bonus rounds!</Text>
                <Text style={styles.instructionText}>One mistake in bonus = game over</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={startGame}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Start Lightning Round</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setShowRules(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>How to Play</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Game Over Screen */}
        {showGameOver && (
          <View style={styles.fullscreenOverlay}>
            <View style={styles.gameOverScreen}>
              <Text style={styles.gameOverTitle}>Lightning Round Complete!</Text>
              <Text style={styles.finalScore}>{score.toLocaleString()}</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Max Streak</Text>
                  <Text style={styles.statBoxValue}>{streak}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Puzzles Solved</Text>
                  <Text style={styles.statBoxValue}>{solved}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Level Reached</Text>
                  <Text style={styles.statBoxValue}>{level}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={startGame}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Rules Screen */}
        {showRules && (
          <View style={styles.fullscreenOverlay}>
            <View style={styles.rulesScreen}>
              <View style={styles.rulesHeader}>
                <Text style={styles.rulesTitle}>How to Play</Text>
                <TouchableOpacity 
                  onPress={() => setShowRules(false)}
                  style={styles.simpleCloseButton}
                >
                  <Text style={styles.simpleCloseText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.rulesContent}>
                <Text style={styles.ruleText}><Text style={styles.boldText}>Goal:</Text> Find a 5-letter bridge word that connects both words</Text>
                
                <View style={styles.compactExampleContainer}>
                  <Text style={styles.compactExampleTitle}>Letter Sharing Rule:</Text>
                  
                  <View style={styles.exampleRow}>
                    <Text style={styles.exampleWord}>HEART</Text>
                    <Text style={styles.arrow}>→</Text>
                    <Text style={styles.bridgeWord}>PACER</Text>
                    <Text style={styles.arrow}>→</Text>
                    <Text style={styles.exampleWord}>SPACE</Text>
                  </View>
                  
                  <Text style={styles.compactSharingRule}>Bridge word must share ≥2 letters with BOTH words</Text>
                </View>
                
                <Text style={styles.ruleText}><Text style={styles.boldText}>Game:</Text> Complete 10 rounds to finish</Text>
                <Text style={styles.ruleText}><Text style={styles.boldText}>Bonus:</Text> Perfect streak unlocks bonus rounds</Text>
                <Text style={styles.ruleText}><Text style={styles.boldText}>Scoring:</Text> Base 100 + time bonus + streak multiplier</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => setShowRules(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#1EB2E8', // NYT-style blue background
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gameBoard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 0,
    paddingHorizontal: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
  },
  rulesIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesIconButtonAbsolute: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  modeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modeTextActive: {
    color: 'white',
  },
  wordsSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  timerMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  timerMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b35',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 107, 53, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00ff88',
    textShadowColor: 'rgba(0, 255, 136, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
    minHeight: 45,
    textAlign: 'center',
  },
  timerWarning: {
    color: '#ff6b35',
    textShadowColor: 'rgba(255, 107, 53, 0.8)',
  },
  timerCritical: {
    color: '#ff1744',
    textShadowColor: 'rgba(255, 23, 68, 1)',
  },
  progressBar: {
    width: 300,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  progressWarning: {
    backgroundColor: '#ff6b35',
  },
  progressCritical: {
    backgroundColor: '#ff1744',
  },
  speedBonusContainer: {
    marginTop: 10,
    height: 25,
    justifyContent: 'center',
  },
  feedbackContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    position: 'relative',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
  },
  animatedSuccessContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 10,
  },
  singleConfettiContainer: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 20,
    pointerEvents: 'none',
  },
  largeConfetti: {
    fontSize: 32,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  controlsContainer: {
    minHeight: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  speedBonusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  wordContainer: {
    marginVertical: 4,
    alignItems: 'center',
  },
  inputContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  letterTile: {
    backgroundColor: '#ffd54f',
    width: 65,
    height: 65,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 4,
    borderTopColor: '#fff176',
    borderLeftColor: '#fff176',
    borderRightColor: '#ff8f00',
    borderBottomColor: '#ff8f00',
    shadowColor: '#d84315',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  letterText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5d4037',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  emptyLetterTile: {
    backgroundColor: 'rgba(255, 213, 79, 0.3)',
    width: 65,
    height: 65,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 3,
    borderColor: 'rgba(255, 213, 79, 0.6)',
    borderStyle: 'dashed',
  },
  emptyLetterText: {
    fontSize: 26,
    color: 'rgba(255, 213, 79, 0.8)',
    fontWeight: 'bold',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loaderContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginVertical: 10,
  },
  newPuzzleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 10,
  },
  newPuzzleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  keyboard: {
    width: '100%',
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 8,
    marginTop: 'auto',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
    paddingHorizontal: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gameOverContent: {
    alignItems: 'center',
    justifyContent: 'center', 
    padding: 30,
    minWidth: 300,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff8f00',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 143, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  finalScore: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffd700',
    marginVertical: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  achievements: {
    marginVertical: 20,
    width: '100%',
  },
  achievement: {
    backgroundColor: 'rgba(255, 143, 0, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 143, 0, 0.3)',
  },
  achievementText: {
    fontSize: 16,
    color: '#5d4037',
    textAlign: 'center',
    fontWeight: '600',
  },
  gameOverButtons: {
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  ruleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#4a5568',
  },
  diagramContainer: {
    backgroundColor: '#f7fafc',
    padding: 20,
    borderRadius: 12,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  diagramTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 15,
    textAlign: 'center',
  },
  diagramRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  diagramWord: {
    backgroundColor: '#667eea',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  diagramBridge: {
    backgroundColor: '#48bb78',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  diagramArrow: {
    fontSize: 18,
    color: '#718096',
    marginHorizontal: 8,
  },
  sharingExample: {
    marginBottom: 15,
  },
  sharingText: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 5,
    textAlign: 'center',
  },
  sharedLetters: {
    fontWeight: 'bold',
    color: '#48bb78',
  },
  ruleHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e53e3e',
    textAlign: 'center',
    backgroundColor: '#fff5f5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  startOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  startLogoContainer: {
    backgroundColor: 'rgba(93, 64, 55, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  startLogoImage: {
    width: 200,
    height: 70,
  },
  startSubtitle: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 30,
    textAlign: 'center',
  },
  startStats: {
    marginBottom: 30,
    alignItems: 'center',
  },
  startStatsText: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#ff8f00',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 3,
    borderTopColor: '#ffb74d',
    borderLeftColor: '#ffb74d',
    borderRightColor: '#e65100',
    borderBottomColor: '#e65100',
    shadowColor: '#d84315',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(93, 64, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  rulesButtonSmall: {
    backgroundColor: 'rgba(113, 128, 150, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(113, 128, 150, 0.3)',
  },
  rulesButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // NYT-Style Simple Buttons
  simpleButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  simpleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 8,
    minWidth: 200,
  },
  primaryButtonText: {
    color: '#1EB2E8',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 8,
    minWidth: 200,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Progress Bar
  progressBar: {
    width: 300,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  
  // Fullscreen Overlays
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1EB2E8',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  startScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  startTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Bodoni Moda',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  startSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  startInstructions: {
    marginBottom: 40,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  gameOverScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    width: '100%',
    maxWidth: 400,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 32,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    gap: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    minWidth: 70,
  },
  statBoxLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textAlign: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  rulesScreen: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 40,
    paddingTop: 60,
    width: '100%',
    height: '100%',
  },
  rulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  rulesTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rulesContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  ruleText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  compactExampleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    width: '90%',
    maxWidth: 280,
  },
  compactExampleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  compactSharingRule: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 6,
    borderRadius: 4,
  },
  simpleCloseButton: {
    padding: 4,
  },
  simpleCloseText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  exampleWord: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bridgeWord: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  arrow: {
    fontSize: 20,
    color: 'white',
    marginHorizontal: 12,
  },
  sharingRule: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 6,
  },
  streakOverlay: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    pointerEvents: 'none',
  },
  fireEmojiContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fireEmoji: {
    fontSize: 36,
    marginHorizontal: 4,
    textShadowColor: 'rgba(255, 140, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  streakText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  feedback: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  feedbackError: {
    color: '#ff6b6b',
  },
  feedbackSuccess: {
    color: 'white',
  },
});