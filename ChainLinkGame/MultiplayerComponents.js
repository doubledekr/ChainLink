// MultiplayerComponents.js
// React Native components for ChainLink multiplayer functionality

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Modal,
  TextInput
} from 'react-native';

// Import existing components
import { 
  KeyboardKey
} from './CustomUIComponents';

const { width, height } = Dimensions.get('window');

// Keyboard layout (same as single-player)
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

// Letter tiles rendering function (fixed for multiplayer)
const renderLetterTiles = (word, isInput = false, isEmpty = false, isValidated = false, isCorrect = false) => {
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
              // Only show green/red after validation, not while typing
              isInput && isValidated && letter && isCorrect && {
                backgroundColor: '#4CAF50',
                borderColor: '#2E7D32'
              },
              isInput && isValidated && letter && !isCorrect && {
                backgroundColor: '#ff6b6b',
                borderColor: '#ff0000'
              }
            ]}
          >
            <Text style={[
              letter ? styles.letterText : styles.emptyLetterText,
              isInput && isValidated && letter && isCorrect && { color: 'white' }
            ]}>
              {letter || '_'}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// Main Multiplayer Game Component
export const MultiplayerChainLink = ({ onBackToMenu, multiplayerManager }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'searching', 'playing', 'results'
  const [opponent, setOpponent] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [matchResult, setMatchResult] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const [feedback, setFeedback] = useState('');
  const [keyPressed, setKeyPressed] = useState(null);
  const [wordValidated, setWordValidated] = useState(false);
  const [wordCorrect, setWordCorrect] = useState(false);
  
  // Round-based system
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [roundWinner, setRoundWinner] = useState(null);
  const [roundWinningWord, setRoundWinningWord] = useState('');
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [startWord, setStartWord] = useState('');
  const [endWord, setEndWord] = useState('');
  
  // Animation for key press (same as single-player)
  const keyPressAnim = useRef(new Animated.Value(1)).current;
  
  // Fire animation for round wins
  const fireAnim = useRef(new Animated.Value(0)).current;
  const [showFireAnimation, setShowFireAnimation] = useState(false);
  const [fireEmojis, setFireEmojis] = useState([]);
  
  // Sad face animation for round losses
  const sadAnim = useRef(new Animated.Value(0)).current;
  const [showSadAnimation, setShowSadAnimation] = useState(false);
  const [sadEmojis, setSadEmojis] = useState([]);
  
  // Word validation cache for performance
  const wordValidationCache = useRef(new Map()).current;

  // Initial puzzle setup - each round has start and end words
  const initialPuzzles = [
    { start: "TOWER", end: "BEACH", solutions: ["WATER", "REACH", "TEACH"] },
    { start: "HEART", end: "SPACE", solutions: ["EARTH", "CHART", "PEACE"] },
    { start: "STORM", end: "LIGHT", solutions: ["SHORT", "SPORT", "SIGHT"] },
    { start: "MAGIC", end: "TRUTH", solutions: ["MATCH", "TEACH", "TORCH"] },
    { start: "BRAVE", end: "SMILE", solutions: ["BLAME", "SCALE", "MAPLE"] }
  ];

  const timerRef = useRef(null);

  // Dictionary API functions (optimized for speed)
  const checkWord = async (word) => {
    // Check cache first
    if (wordValidationCache.has(word)) {
      console.log(`💾 Using cached result for word: ${word}`);
      return wordValidationCache.get(word);
    }

    try {
      console.log(`🌐 Making API call for word: ${word}`);
      
      // Add timeout for faster response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const isValid = response.ok;
      console.log(`📡 API response for "${word}": ${isValid ? '✅ valid' : '❌ invalid'}`);
      
      // Cache the result
      wordValidationCache.set(word, isValid);
      
      return isValid;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log(`⏰ API timeout for "${word}", assuming invalid`);
      } else {
        console.log(`🚨 API error for "${word}":`, err);
      }
      
      // Cache negative result to avoid repeated failed calls
      wordValidationCache.set(word, false);
      return false;
    }
  };

  // Smart word selection for multiplayer (same algorithm as single-player)
  const selectSmartWords = (count = 2, currentRound = 1, previousWords = []) => {
    console.log(`🧠 Multiplayer smart word selection: Round ${currentRound}, Previous: ${previousWords.join(', ')}`);
    
    // Word database for multiplayer
    const wordDatabase = {
      easy: [
        "TOWER", "BEACH", "WATER", "REACH", "HEART", "SPACE", "EARTH", "CHART",
        "HOUSE", "RIVER", "HORSE", "CHAIR", "TABLE", "PHONE", "PAPER", "PLACE",
        "WORLD", "BREAD", "CLEAN", "CLEAR", "LIGHT", "PLANT", "STONE", "FLAME"
      ],
      medium: [
        "STORM", "PEACE", "CREAM", "STEAM", "MAGIC", "TRUTH", "MATCH", "TEACH",
        "BRAVE", "SMILE", "BLAME", "SCALE", "DREAM", "TREND", "MUSIC", "DANCE",
        "SONIC", "PANIC", "OCEAN", "PLANE", "CROWN", "CLOWN", "GROWN", "SLANT",
        "SHARP", "SMART", "START", "SPORT", "SHORT", "SHIRT", "SHIFT", "SHELF"
      ],
      hard: [
        "PROXY", "QUILT", "ZEBRA", "FJORD", "WALTZ", "BLITZ", "QUIRK", "ZESTY",
        "JUMPY", "FIZZY", "JAZZY", "DIZZY", "FUZZY", "PIZZA", "BUZZY", "FRIZZ"
      ]
    };
    
    // Determine difficulty - multiplayer starts medium for competitive balance
    let difficultyMix;
    if (currentRound <= 2) {
      difficultyMix = { easy: 0.5, medium: 0.4, hard: 0.1 }; // Start balanced
    } else if (currentRound <= 4) {
      difficultyMix = { easy: 0.3, medium: 0.5, hard: 0.2 }; // Increase challenge
    } else {
      difficultyMix = { easy: 0.2, medium: 0.4, hard: 0.4 }; // High difficulty
    }
    
    // Score words for diversity and challenge
    const scoreWord = (word) => {
      let score = 0;
      
      // Diversity bonus
      const usedLetters = new Set(previousWords.join('').split(''));
      const wordLetters = new Set(word.split(''));
      const newLetters = [...wordLetters].filter(letter => !usedLetters.has(letter));
      score += newLetters.length * 12; // Higher bonus for multiplayer
      
      // Uncommon letter bonus
      const uncommonLetters = ['Q', 'X', 'Z', 'J', 'K', 'V', 'W', 'Y'];
      const uncommonCount = word.split('').filter(letter => uncommonLetters.includes(letter)).length;
      score += uncommonCount * 10;
      
      return score;
    };
    
    // Create candidate pool
    const candidates = [];
    Object.entries(difficultyMix).forEach(([difficulty, ratio]) => {
      const categoryWords = wordDatabase[difficulty] || [];
      const neededCount = Math.ceil(count * ratio * 2);
      candidates.push(...categoryWords.slice(0, neededCount));
    });
    
    // Select best scoring words
    const scoredWords = candidates
      .filter(word => !previousWords.includes(word))
      .map(word => ({ word, score: scoreWord(word) }))
      .sort((a, b) => b.score - a.score);
    
    const selectedWords = [];
    for (let i = 0; i < count && i < scoredWords.length; i++) {
      selectedWords.push(scoredWords[i].word);
    }
    
    console.log(`🎯 Multiplayer smart selection: ${selectedWords.join(', ')}`);
    return selectedWords;
  };

  const fetchRandomWords = async (count = 2) => {
    try {
      console.log(`🎲 Generating ${count} smart words for multiplayer`);
      
      // Use smart word selection
      const words = selectSmartWords(count, currentRound, [startWord, endWord].filter(Boolean));
      
      console.log(`✅ Got smart multiplayer words: ${words.join(', ')}`);
      return words;
    } catch (err) {
      console.log(`🚨 Error in smart word generation:`, err);
      // Fallback to basic words
      const fallbackWords = ['TOWER', 'BEACH', 'HEART', 'SPACE', 'STORM', 'PEACE', 'MAGIC', 'TRUTH'];
      const shuffled = [...fallbackWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }
  };

  const validateBridgeWord = async (word, startWord, endWord) => {
    console.log(`🔍 Validating bridge word: ${word} between ${startWord} and ${endWord}`);
    
    // First check if it's a valid English word
    const isValidWord = await checkWord(word);
    if (!isValidWord) {
      console.log(`❌ "${word}" is not a valid English word`);
      return false;
    }
    
    // Check letter sharing with start word
    const startSharedCount = countSharedLetters(word, startWord);
    const endSharedCount = countSharedLetters(word, endWord);
    
    console.log(`📊 Shared letters: ${word} ↔ ${startWord} = ${startSharedCount}, ${word} ↔ ${endWord} = ${endSharedCount}`);
    
    // Must share at least 2 letters with both start and end words
    const isValidBridge = startSharedCount >= 2 && endSharedCount >= 2;
    
    console.log(`${isValidBridge ? '✅' : '❌'} Bridge validation result: ${isValidBridge}`);
    return isValidBridge;
  };

  const countSharedLetters = (word1, word2) => {
    if (!word1 || !word2) return 0;
    
    const letters1 = word1.split('');
    const letters2 = word2.split('');
    let sharedCount = 0;
    
    // Count shared letters (case insensitive)
    for (let letter of letters1) {
      const index = letters2.indexOf(letter.toUpperCase());
      if (index !== -1) {
        sharedCount++;
        letters2.splice(index, 1); // Remove to avoid double counting
      }
    }
    
    return sharedCount;
  };

  // Generate random fire emojis to fill entire screen
  const generateRandomFireEmojis = () => {
    const seed = Date.now(); // Use timestamp as seed
    const random = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const emojis = [];
    const emojiSize = 30; // Smaller spacing for more coverage
    const cols = Math.ceil(width / emojiSize) + 4; // Extra columns for overlap
    const rows = Math.ceil(height / emojiSize) + 4; // Extra rows for overlap
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const id = row * cols + col;
        emojis.push({
          id: id,
          x: col * emojiSize + random(seed + id * 123) * 25 - 12, // Larger random offset for overlap
          y: row * emojiSize + random(seed + id * 456) * 25 - 12,
          delay: random(seed + id * 789) * 600, // Shorter delays for fuller effect
          scale: 0.9 + random(seed + id * 321) * 0.6, // Larger scale range 0.9-1.5
        });
      }
    }
    return emojis;
  };

  // Generate random sad emojis to fill entire screen
  const generateRandomSadEmojis = () => {
    const seed = Date.now();
    const random = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const emojis = [];
    const emojiSize = 35; // Smaller spacing for more coverage
    const cols = Math.ceil(width / emojiSize) + 4; // Extra columns for overlap
    const rows = Math.ceil(height / emojiSize) + 4; // Extra rows for overlap
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const id = row * cols + col;
        emojis.push({
          id: id,
          x: col * emojiSize + random(seed + id * 234) * 30 - 15, // Larger random offset for overlap
          y: row * emojiSize + random(seed + id * 567) * 30 - 15,
          delay: random(seed + id * 890) * 500, // Shorter delays
          scale: 0.8 + random(seed + id * 432) * 0.5, // Scale range 0.8-1.3
        });
      }
    }
    return emojis;
  };

  // Fire animation function with staggered delays
  const triggerFireAnimation = () => {
    const randomFireEmojis = generateRandomFireEmojis();
    setFireEmojis(randomFireEmojis);
    setShowFireAnimation(true);
    fireAnim.setValue(0);
    
    // Simple animation that all emojis will use with their individual delays
    Animated.timing(fireAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      setShowFireAnimation(false);
      setFireEmojis([]);
    });
  };

  // Sad animation function with staggered delays
  const triggerSadAnimation = () => {
    const randomSadEmojis = generateRandomSadEmojis();
    setSadEmojis(randomSadEmojis);
    setShowSadAnimation(true);
    sadAnim.setValue(0);
    
    // Simple animation that all emojis will use with their individual delays
    Animated.timing(sadAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      setShowSadAnimation(false);
      setSadEmojis([]);
    });
  };

  // Key press handler (same as single-player)
  const handleKeyPress = (key) => {
    if (gameState !== 'playing') return;

    setKeyPressed(key);
    
    // Animate key press
    Animated.sequence([
      Animated.timing(keyPressAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(keyPressAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    // Reset key pressed state
    setTimeout(() => setKeyPressed(null), 200);

    if (key === 'ENTER') {
      submitWord();
    } else if (key === 'BACKSPACE') {
      setCurrentWord(prev => prev.slice(0, -1));
    } else if (currentWord.length < 5) {
      setCurrentWord(prev => prev + key);
    }
  };

  useEffect(() => {
    // Set up multiplayer callbacks
    if (multiplayerManager) {
      multiplayerManager.setCallbacks({
        onMatchFound: handleMatchFound,
        onOpponentMove: handleOpponentMove,
        onMatchEnd: handleMatchEnd
      });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleMatchFound = (matchData) => {
    console.log('🎮 Match found:', matchData);
    setOpponent(matchData.opponent);
    startMultiplayerGame();
  };

  const handleOpponentMove = (moveData) => {
    console.log('👥 Opponent move:', moveData);
    
    switch (moveData.type) {
      case 'round_won':
        // Opponent won this round
        handleRoundEnd('opponent', moveData.word);
        break;
      case 'round_start':
        // New round starting - sync with opponent's round setup
        startNewRound(moveData.round, moveData.startWord, moveData.endWord);
        break;
      case 'match_completed':
        handleMatchEnd(moveData);
        break;
    }
  };

  const handleMatchEnd = (resultData) => {
    setMatchResult(resultData);
    setGameState('results');
  };

  const findMatch = async () => {
    setGameState('searching');
    try {
      const foundMatch = await multiplayerManager.findQuickMatch();
      if (!foundMatch) {
        Alert.alert('Error', 'Could not find a match. Please try again.');
        setGameState('menu');
      }
    } catch (error) {
      console.error('Find match error:', error);
      Alert.alert('Error', 'Could not find a match. Please try again.');
      setGameState('menu');
    }
  };

  const startMultiplayerGame = () => {
    // Start immediately with fallback, then update with fresh words
    setGameState('playing');
    setPlayerScore(0);
    setOpponentScore(0);
    setCurrentRound(1);
    setTimeRemaining(30);
    setCurrentWord('');
    setFeedback('');
    setShowRoundResult(false);
    setWordValidated(false);
    setWordCorrect(false);
    
    // Use fallback puzzle for instant start
    const firstPuzzle = initialPuzzles[0];
    setStartWord(firstPuzzle.start);
    setEndWord(firstPuzzle.end);
    setCurrentPuzzle(firstPuzzle);
    
    console.log(`🎯 Starting multiplayer instantly with: ${firstPuzzle.start} → ${firstPuzzle.end}`);
    
    // Start timer immediately
    startGameTimer();
    
    // Fetch fresh words in background for next round
    fetchFreshWordsInBackground();
  };

  const fetchFreshWordsInBackground = async () => {
    try {
      console.log('🔄 Fetching fresh words for future rounds...');
      const words = await fetchRandomWords(4); // Get extra words for multiple rounds
      // Store these for later use in subsequent rounds
      console.log(`✅ Fresh words ready for future rounds: ${words.join(', ')}`);
    } catch (error) {
      console.log('⚠️ Background word fetching failed, will use fallbacks');
    }
  };

  const startNewRound = (round, keepStartWord, newEndWord) => {
    setCurrentRound(round);
    setTimeRemaining(30);
    setCurrentWord('');
    setFeedback('');
    setShowRoundResult(false);
    setRoundWinner(null);
    setRoundWinningWord('');
    setWordValidated(false);
    setWordCorrect(false);
    
    // Set up new puzzle - keep start word, winning word becomes new end word
    const currentStartWord = keepStartWord || startWord;
    setStartWord(currentStartWord);
    setEndWord(newEndWord);
    
    // Use dynamic validation instead of predefined solutions
    setCurrentPuzzle({ 
      start: currentStartWord, 
      end: newEndWord, 
      solutions: [] // Will be validated dynamically via API
    });
    
    console.log(`🔄 Round ${round}: ${currentStartWord} → ? → ${newEndWord}`);
    
    // Start timer
    startGameTimer();
  };

  const handleRoundEnd = (winner, winningWord) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setRoundWinner(winner);
    setRoundWinningWord(winningWord);
    setShowRoundResult(true);
    
    // Update scores and trigger appropriate animation
    if (winner === 'player') {
      setPlayerScore(prev => prev + 1);
      // Trigger fire animation for player wins
      triggerFireAnimation();
    } else {
      setOpponentScore(prev => prev + 1);
      // Trigger sad animation for player losses
      triggerSadAnimation();
    }
    
    // Clear current input
    setCurrentWord('');
    
    if (winner === 'opponent') {
      setFeedback('Opponent won this round!');
    } else {
      setFeedback('You won this round!');
    }
    
    // Start next round after showing result
    setTimeout(() => {
      if (currentRound >= maxRounds) {
        // Game over
        endMatch();
      } else {
        // Start next round: keep same start word, winning word becomes new end word
        const nextRound = currentRound + 1;
        startNewRound(nextRound, startWord, winningWord);
        
        // Send round start to opponent
        multiplayerManager.sendGameMove({
          type: 'round_start',
          round: nextRound,
          startWord: startWord,
          endWord: winningWord
        });
      }
    }, 3000); // Show result for 3 seconds
  };

  const startGameTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Round timeout - no winner
          handleRoundTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRoundTimeout = () => {
    setFeedback('⏰ Time up! No one won this round.');
    setShowRoundResult(true);
    
    // Start next round after timeout
    setTimeout(() => {
      if (currentRound >= maxRounds) {
        endMatch();
      } else {
        // Continue with same puzzle if no one won
        const nextRound = currentRound + 1;
        startNewRound(nextRound, startWord, endWord);
      }
    }, 2000);
  };

  const submitWord = async () => {
    if (!currentPuzzle || !currentWord || currentWord.length !== 5 || showRoundResult) return;

    const word = currentWord.toUpperCase();
    
    // Set validation state to show feedback
    setWordValidated(true);
    
    // Use API validation instead of predefined solutions
    const isValid = await validateBridgeWord(word, startWord, endWord);
    setWordCorrect(isValid);
    
    if (isValid) {
      // Show success briefly before clearing
      setFeedback('✅ Correct! You won this round!');
      
      setTimeout(() => {
        // Player won this round!
        handleRoundEnd('player', word);
        
        // Send round win to opponent
        multiplayerManager.sendGameMove({
          type: 'round_won',
          word: word,
          round: currentRound,
          winner: 'player'
        });
        
        // Reset validation state
        setWordValidated(false);
        setWordCorrect(false);
        setCurrentWord('');
      }, 1000);
    } else {
      // Show error briefly then clear word for next attempt
      setFeedback('❌ Try again!');
      
      setTimeout(() => {
        setCurrentWord('');
        setFeedback('');
        setWordValidated(false);
        setWordCorrect(false);
      }, 1500);
    }
  };

  const calculatePoints = (word, timeLeft) => {
    const basePoints = 100;
    const timeBonus = timeLeft * 5;
    const lengthBonus = word.length * 10;
    return basePoints + timeBonus + lengthBonus;
  };

  const endMatch = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    await multiplayerManager.sendGameMove({
      type: 'match_completed',
      playerScore: playerScore,
      opponentScore: opponentScore
    });
    
    // Determine match winner
    const won = playerScore > opponentScore;
    const result = {
      won: won,
      playerScore: playerScore,
      opponentScore: opponentScore,
      totalRounds: maxRounds
    };
    
    setMatchResult(result);
    setGameState('results');
    
    // Submit match result
    multiplayerManager.submitMatchResult(playerScore, won);
    multiplayerManager.endMatch();
  };

  // Render different screens based on game state
  if (gameState === 'menu') {
    return <MultiplayerMenu onFindMatch={findMatch} onBack={onBackToMenu} />;
  }

  if (gameState === 'searching') {
    return <MatchmakingScreen onCancel={() => setGameState('menu')} />;
  }

  if (gameState === 'playing') {
    return (
      <MultiplayerGameScreen
        currentPuzzle={currentPuzzle}
        startWord={startWord}
        endWord={endWord}
        timeRemaining={timeRemaining}
        playerScore={playerScore}
        opponentScore={opponentScore}
        opponent={opponent}
        currentWord={currentWord}
        onKeyPress={handleKeyPress}
        feedback={feedback}
        currentRound={currentRound}
        maxRounds={maxRounds}
        showRoundResult={showRoundResult}
        roundWinner={roundWinner}
        roundWinningWord={roundWinningWord}
        showFireAnimation={showFireAnimation}
        fireAnim={fireAnim}
        fireEmojis={fireEmojis}
        showSadAnimation={showSadAnimation}
        sadAnim={sadAnim}
        sadEmojis={sadEmojis}
        wordValidated={wordValidated}
        wordCorrect={wordCorrect}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <MatchResultsScreen
        result={matchResult}
        onPlayAgain={findMatch}
        onBackToMenu={() => setGameState('menu')}
      />
    );
  }

  return null;
};

// Multiplayer Menu Component
export const MultiplayerMenu = ({ onFindMatch, onBack }) => {
  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuPanel}>
        <Text style={styles.menuTitle}>⚡ Multiplayer Mode</Text>
        <Text style={styles.menuSubtitle}>Challenge players worldwide!</Text>
        
        <View style={styles.menuButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onFindMatch}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>🎯 Quick Match</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Alert.alert('Coming Soon', 'Tournament mode will be available soon!')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>🏆 Tournament</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Alert.alert('Leaderboards', 'View global rankings!')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>📊 Leaderboards</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Matchmaking Screen Component
export const MatchmakingScreen = ({ onCancel }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.matchmakingContainer}>
      <View style={styles.matchmakingPanel}>
        <Animated.Text style={[styles.searchingIcon, { transform: [{ rotate: spinInterpolate }] }]}>
          🔍
        </Animated.Text>
        <Text style={styles.searchingText}>Finding opponent...</Text>
        <Text style={styles.searchingSubtext}>This may take a few moments</Text>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main Multiplayer Game Screen
export const MultiplayerGameScreen = ({
  currentPuzzle,
  startWord,
  endWord,
  timeRemaining,
  playerScore,
  opponentScore,
  opponent,
  currentWord,
  onKeyPress,
  feedback,
  currentRound,
  maxRounds,
  showRoundResult,
  roundWinner,
  roundWinningWord,
  showFireAnimation,
  fireAnim,
  fireEmojis,
  showSadAnimation,
  sadAnim,
  sadEmojis,
  wordValidated,
  wordCorrect
}) => {
  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameBoard}>
        {/* Header with scores and timer */}
        <View style={styles.headerContainer}>
          <View style={styles.multiplayerHeader}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>You</Text>
              <Text style={styles.playerScore}>{playerScore}</Text>
            </View>
            
            <View style={styles.timerContainer}>
              <Text style={styles.roundInfo}>Round {currentRound}/{maxRounds}</Text>
              <Text style={[styles.timer, timeRemaining <= 10 && styles.timerCritical]}>
                {timeRemaining}s
              </Text>
              <View style={styles.timerBar}>
                <View 
                  style={[
                    styles.timerProgress, 
                    { width: `${((30 - timeRemaining) / 30) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{opponent?.displayName || 'Opponent'}</Text>
              <Text style={styles.opponentScore}>{opponentScore}</Text>
            </View>
          </View>
        </View>

        {/* Game Words - round-based progression */}
        <View style={styles.puzzleArea}>
          <View style={styles.wordDisplay}>
            {/* Top word - start word for this round */}
            {startWord && renderLetterTiles(startWord)}
            
            {/* Middle word - current player input */}
            <View style={styles.inputContainer}>
              {currentWord.length > 0 
                ? renderLetterTiles(currentWord, true, false, wordValidated, wordCorrect)
                : renderLetterTiles('', false, true)}
            </View>
            
            {/* Bottom word - where winning word will appear */}
            {endWord ? 
              renderLetterTiles(endWord) : 
              renderLetterTiles('', false, true)
            }
          </View>
        </View>

        {/* Round status - only show for opponent wins or timeouts */}
        <View style={styles.roundStatus}>
          {showRoundResult && roundWinner !== 'player' && (
            <View style={styles.roundResultContainer}>
              <Text style={styles.roundResultText}>
                {roundWinner === 'opponent' ? '😔 Opponent won this round!' : 
                 '⏰ Time up! No winner this round.'}
              </Text>
              {roundWinningWord && (
                <Text style={styles.winningWordText}>
                  Winning word: {roundWinningWord}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Keyboard (same as single-player) */}
        <View style={styles.keyboard}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyboardRow}>
              {rowIndex === 2 && (
                <KeyboardKey
                  letter="ENTER"
                  onPress={onKeyPress}
                  isSpecial={true}
                  pressed={false}
                  animatedValue={null}
                />
              )}
              {row.map((letter) => (
                <KeyboardKey
                  key={letter}
                  letter={letter}
                  onPress={onKeyPress}
                  pressed={false}
                  animatedValue={null}
                />
              ))}
              {rowIndex === 2 && (
                <KeyboardKey
                  letter="BACKSPACE"
                  onPress={onKeyPress}
                  isSpecial={true}
                  pressed={false}
                  animatedValue={null}
                />
              )}
            </View>
          ))}
        </View>
      </View>
      
      {/* Random Fire Animation Overlay for Wins - Full Screen Coverage */}
      {showFireAnimation && fireEmojis.map((emoji) => (
        <Animated.View
          key={emoji.id}
          style={[
            styles.randomEmojiOverlay,
            {
              left: emoji.x,
              top: emoji.y,
              opacity: fireAnim.interpolate({
                inputRange: [emoji.delay / 2500, (emoji.delay + 300) / 2500, (emoji.delay + 1500) / 2500, 1],
                outputRange: [0, 1, 1, 0],
                extrapolate: 'clamp'
              }),
              transform: [
                { scale: emoji.scale },
                {
                  translateY: fireAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200] // Move up 200px
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.randomFireEmoji}>🔥</Text>
        </Animated.View>
      ))}

      {/* Random Sad Animation Overlay for Losses - Full Screen Coverage */}
      {showSadAnimation && sadEmojis.map((emoji) => (
        <Animated.View
          key={emoji.id}
          style={[
            styles.randomEmojiOverlay,
            {
              left: emoji.x,
              top: emoji.y,
              opacity: sadAnim.interpolate({
                inputRange: [emoji.delay / 2500, (emoji.delay + 400) / 2500, (emoji.delay + 1200) / 2500, 1],
                outputRange: [0, 1, 1, 0],
                extrapolate: 'clamp'
              }),
              transform: [
                { scale: emoji.scale },
                {
                  translateY: sadAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200] // Move up 200px
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.randomSadEmoji}>😢</Text>
        </Animated.View>
      ))}

      {/* Central Win/Loss Message */}
      {(showFireAnimation || showSadAnimation) && (
        <Animated.View style={[
          styles.centralMessageOverlay,
          {
            opacity: (showFireAnimation ? fireAnim : sadAnim).interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 1, 1, 0]
            }),
            transform: [{
              scale: (showFireAnimation ? fireAnim : sadAnim).interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1.2, 1]
              })
            }]
          }
        ]}>
          <Text style={showFireAnimation ? styles.winText : styles.loseText}>
            {showFireAnimation ? '🎉 You Won This Round!' : '😔 Opponent Won This Round!'}
          </Text>
          {roundWinningWord && (
            <Text style={styles.winningWordText}>
              Winning word: {roundWinningWord}
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
};

// Match Results Screen
export const MatchResultsScreen = ({ result, onPlayAgain, onBackToMenu }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.resultsContainer}>
      <Animated.View style={[styles.resultsPanel, { transform: [{ scale: scaleValue }] }]}>
        <Text style={[styles.resultTitle, result.won ? styles.winTitle : styles.loseTitle]}>
          {result.won ? '🏆 Victory!' : '💪 Good Game!'}
        </Text>
        
        <View style={styles.scoreComparison}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={[styles.scoreValue, result.won && styles.winningScore]}>
              {result.playerScore}
            </Text>
          </View>
          
          <Text style={styles.vs}>VS</Text>
          
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Opponent</Text>
            <Text style={[styles.scoreValue, !result.won && styles.winningScore]}>
              {result.opponentScore}
            </Text>
          </View>
        </View>
        
        <View style={styles.resultButtons}>
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={onPlayAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.playAgainButtonText}>🔄 Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => Alert.alert('Stats', 'Detailed match statistics coming soon!')}
            activeOpacity={0.8}
          >
            <Text style={styles.statsButtonText}>📊 View Stats</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onBackToMenu}
            activeOpacity={0.8}
          >
            <Text style={styles.menuButtonText}>← Menu</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Styles (matching single-player design)
const styles = StyleSheet.create({
  // Menu styles
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1EB2E8',
  },
  menuPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  menuTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Bodoni Moda',
  },
  menuSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  menuButtons: {
    width: '100%',
    alignItems: 'center',
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
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginVertical: 8,
    minWidth: 200,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Matchmaking styles
  matchmakingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1EB2E8',
  },
  matchmakingPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  searchingIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  searchingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Bodoni Moda',
  },
  searchingSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 40,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 150,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Game screen styles (matching single-player)
  gameContainer: {
    flex: 1,
    backgroundColor: '#1EB2E8',
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
    justifyContent: 'center',
    width: '100%',
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
  },
  multiplayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  playerInfo: {
    alignItems: 'center',
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  playerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  opponentScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  timerContainer: {
    alignItems: 'center',
    flex: 1,
  },
  roundInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  timerCritical: {
    color: '#ff6b6b',
  },
  timerBar: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },

  // Puzzle area (matching single-player)
  puzzleArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wordDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
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
  feedback: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: 'white',
  },

  // Round status styles
  roundStatus: {
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundResultContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    minWidth: 250,
  },
  roundResultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  winningWordText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Random emoji animation overlay styles
  randomEmojiOverlay: {
    position: 'absolute',
    zIndex: 100,
    pointerEvents: 'none',
  },
  randomFireEmoji: {
    fontSize: 35,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  randomSadEmoji: {
    fontSize: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  centralMessageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
    pointerEvents: 'none',
  },
  winText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    fontFamily: 'Bodoni Moda',
    marginVertical: 10,
  },
  loseText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'Bodoni Moda',
    marginVertical: 10,
  },

  // Keyboard styles (same as single-player)
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

  // Results styles
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1EB2E8',
  },
  resultsPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Bodoni Moda',
  },
  winTitle: {
    color: 'white',
  },
  loseTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scoreComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    justifyContent: 'center',
  },
  scoreItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  winningScore: {
    color: 'white',
  },
  vs: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 15,
  },
  resultButtons: {
    width: '100%',
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 8,
    minWidth: 200,
  },
  playAgainButtonText: {
    color: '#1EB2E8',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginVertical: 8,
    minWidth: 200,
  },
  statsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginVertical: 8,
    minWidth: 200,
  },
  menuButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MultiplayerChainLink;
