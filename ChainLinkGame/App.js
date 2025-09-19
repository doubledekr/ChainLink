import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Text, ActivityIndicator, Modal, ImageBackground, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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

// Pre-computed puzzle solutions for instant validation
const puzzles = [
  { start: "TOWER", end: "BEACH", solutions: ["WATER", "REACH", "LATER"] },
  { start: "HEART", end: "SPACE", solutions: ["EARTH", "CHART", "PEACE"] },
  { start: "STORM", end: "PEACE", solutions: ["CREAM", "STEAM", "TRACE"] },
  { start: "MAGIC", end: "TRUTH", solutions: ["MATCH", "TEACH", "TORCH"] },
  { start: "BRAVE", end: "SMILE", solutions: ["BLAME", "SCALE", "MAPLE"] },
  { start: "DREAM", end: "WORLD", solutions: ["DREAD", "BREAD", "TREAD"] },
  { start: "MUSIC", end: "DANCE", solutions: ["MANIC", "SONIC", "PANIC"] },
  { start: "OCEAN", end: "FLAME", solutions: ["CLEAN", "PLANE", "CRANE"] },
  { start: "CROWN", end: "LIGHT", solutions: ["CLOWN", "GROWN", "BROWN"] },
  { start: "PLANT", end: "STONE", solutions: ["PLANE", "PLATE", "SLANT"] },
  { start: "HOUSE", end: "RIVER", solutions: ["HORSE", "HOVER", "COVER"] },
  { start: "BREAD", end: "HONEY", solutions: ["BRAND", "BLEND", "TREND"] },
  { start: "CHAIR", end: "TABLE", solutions: ["CABLE", "CHASE", "CHEAT"] },
  { start: "PHONE", end: "PAPER", solutions: ["PLANE", "PHASE", "PLACE"] },
  { start: "CLOUD", end: "EARTH", solutions: ["CLOTH", "CLEAR", "CHART"] }
];

export default function App() {
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
  const [gameTimeRemaining, setGameTimeRemaining] = useState(120); // 2 minutes
  const [showGameOver, setShowGameOver] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyPressed, setKeyPressed] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  
  // Animations
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const confirmAnim = useRef(new Animated.Value(1)).current;
  const keyPressAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  
  // Timers
  const timerInterval = useRef(null);
  const gameTimer = useRef(null);

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

  // Preload and shuffle puzzles for seamless gameplay
  const getShuffledPuzzles = () => {
    const shuffled = [...puzzles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setStreak(0);
    setSolved(0);
    setLevel(1);
    setCurrentPuzzle(0);
    setGameTimeRemaining(120);
    setShowGameOver(false);
    
    // Shuffle puzzles at start for variety
    const shuffledPuzzles = getShuffledPuzzles();
    
    // Start game timer (2 minutes total)
    gameTimer.current = setInterval(() => {
      setGameTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start with first shuffled puzzle
    const puzzleData = shuffledPuzzles[0];
    setStartWord(puzzleData.start);
    setEndWord(puzzleData.end);
    setCurrentWord('');
    setError(null);
    
    // Start timer immediately
    const newTime = Math.max(15, 30 - Math.floor(1 / 3)); // Level 1 time (30s)
    setTimeRemaining(newTime);
    setInitialTime(newTime);
    
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          timeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameActive(false);
    clearInterval(timerInterval.current);
    clearInterval(gameTimer.current);
    setShowGameOver(true);
  };

  const nextPuzzle = () => {
    const newPuzzleIndex = (currentPuzzle + 1) % puzzles.length;
    setCurrentPuzzle(newPuzzleIndex);
    
    // Instantly load next puzzle - no delays
    const puzzleData = puzzles[newPuzzleIndex];
    setStartWord(puzzleData.start);
    setEndWord(puzzleData.end);
    setCurrentWord('');
    setError(null);
    
    // Reset timer - gets faster as level increases (instant)
    const newTime = Math.max(15, 30 - Math.floor(level / 3));
    setTimeRemaining(newTime);
    setInitialTime(newTime);
    
    // Start puzzle timer immediately
    clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          timeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const timeOut = () => {
    clearInterval(timerInterval.current);
    setStreak(0);
    setError(null);
    
    // Immediately load next puzzle when time expires
    if (gameActive) {
      nextPuzzle();
    }
  };

  const skipPuzzle = () => {
    setScore(prev => Math.max(0, prev - 50));
    setStreak(0);
    clearInterval(timerInterval.current);
    setError('skipped');
    
    // Automatically load next puzzle after skip
    setTimeout(() => {
      if (gameActive) {
        nextPuzzle();
      }
    }, 800); // Fast transition for skip
  };

  const blinkError = () => {
    Animated.sequence([
      Animated.timing(blinkAnim, { toValue: 0.2, duration: 150, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 0.2, duration: 150, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 0.2, duration: 150, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const confirmSuccess = () => {
    Animated.sequence([
      Animated.timing(confirmAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(confirmAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const handleSubmit = async () => {
    const word = currentWord.trim().toUpperCase();
    
    if (!gameActive) return;
    
    // Must be exactly 5 letters
    if (word.length !== 5) {
      setError('invalid');
      blinkError();
      setTimeout(() => {
        setCurrentWord('');
        setError(null);
      }, 1000);
      return;
    }

    // Validate word with API and letter sharing rules
    setIsLoading(true);
    const isValidBridge = await validateBridgeWord(word, startWord, endWord);
    setIsLoading(false);
    
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
      
      // Show streak animation if streak >= 3
      if (newStreak >= 3) {
        setShowStreak(true);
        Animated.sequence([
          Animated.timing(streakAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(1500),
          Animated.timing(streakAnim, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start(() => setShowStreak(false));
      }
      
      // Move to next puzzle faster (1.5s instead of 2s)
      setTimeout(() => {
        if (gameActive) {
          nextPuzzle();
        }
      }, 1500);
      
    } else {
      // WRONG ANSWER (Instant response)
      setStreak(0);
      setError('invalid');
      blinkError();
      
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
                  opacity: blinkAnim, 
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

  return (
    <SafeAreaProvider>
      <View style={styles.fullScreenContainer}>
        <ImageBackground 
          source={Images.background} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
        <SafeAreaView style={styles.container}>
          <View style={styles.gameBoard}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image 
              source={Images.logo} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <TouchableOpacity 
              onPress={() => setShowRules(true)}
              activeOpacity={0.7}
              style={styles.rulesIconButtonAbsolute}
            >
              <Text style={styles.rulesIcon}>ⓘ</Text>
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
              <Text style={styles.statNumber}>{level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          {/* Timer with Progress Bar */}
          <View style={styles.timerContainer}>
            {gameActive ? (
              <>
                <CustomProgressBar 
                  progress={(timeRemaining / initialTime) * 100}
                  width={300}
                  height={12}
                  type="inGame"
                />
                
                {/* Speed Bonus Indicator */}
                <View style={styles.speedBonusContainer}>
                  {timeRemaining > (initialTime * 0.8) && (
                    <Text style={styles.speedBonusText}>⚡ SUPER FAST +100</Text>
                  )}
                  {timeRemaining <= (initialTime * 0.8) && timeRemaining > (initialTime * 0.6) && (
                    <Text style={styles.speedBonusText}>🔥 FAST +50</Text>
                  )}
                  {timeRemaining <= (initialTime * 0.6) && timeRemaining > (initialTime * 0.4) && (
                    <Text style={styles.speedBonusText}>👍 MEDIUM +25</Text>
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
                  <Animated.View style={[styles.streakDisplay, { opacity: streakAnim }]}>
                    <Text style={styles.streakText}>🔥 STREAK x{streak}</Text>
                  </Animated.View>
                )}
              </View>
              {renderLetterTiles(endWord)}
            </View>
          </View>

        {/* Fixed Height Feedback Area */}
        <View style={styles.feedbackContainer}>
          {gameActive && isLoading && (
            <View style={styles.loadingFeedback}>
              <ActivityIndicator color="white" />
              <Text style={styles.feedback}>Checking word...</Text>
            </View>
          )}
          {gameActive && error === 'success' && (
            <Text style={[styles.feedback, styles.feedbackSuccess]}>
              🎉 Perfect! +{((100 + timeRemaining * 10 + (timeRemaining > (initialTime * 0.8) ? 100 : timeRemaining > (initialTime * 0.6) ? 50 : timeRemaining > (initialTime * 0.4) ? 25 : 0) + level * 5) * Math.min(streak, 10)).toLocaleString()} points!
              {timeRemaining > (initialTime * 0.8) && " ⚡ SUPER FAST BONUS!"}
              {timeRemaining <= (initialTime * 0.8) && timeRemaining > (initialTime * 0.6) && " 🔥 FAST BONUS!"}
              {timeRemaining <= (initialTime * 0.6) && timeRemaining > (initialTime * 0.4) && " 👍 SPEED BONUS!"}
            </Text>
          )}
          {gameActive && error === 'invalid' && (
            <Text style={[styles.feedback, styles.feedbackError]}>
              ❌ Word doesn't bridge both words or isn't valid
            </Text>
          )}
        </View>

        {/* Fixed Height Controls Area */}
        <View style={styles.controlsContainer}>
          {gameActive && (
            <CustomButton
              onPress={skipPuzzle}
              text="Skip (-50 pts)"
              size="large"
              color="red"
              textStyle={{ marginTop: -12 }}
            />
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

        {/* Start Game Overlay */}
        <Modal
          visible={!gameActive && !showGameOver}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.startOverlay}>
            <Panel size="medium" style={styles.startContent}>
              <View style={styles.startLogoContainer}>
                <Image 
                  source={Images.logo} 
                  style={styles.startLogoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.startSubtitle}>Bridge words with lightning speed!</Text>
              
              <View style={styles.startStats}>
                <Text style={styles.startStatsText}>Find bridge words in 30 seconds</Text>
                <Text style={styles.startStatsText}>Build streaks for massive multipliers</Text>
                <Text style={styles.startStatsText}>Faster answers = bonus points</Text>
              </View>
              
              <CustomButton
                onPress={startGame}
                text="Start Lightning Round"
                size="large"
                color="yellow"
                style={{ marginVertical: 10 }}
              />
              
              <CustomButton
                onPress={() => setShowRules(true)}
                text="How to Play"
                size="large"
                color="blue"
              />
            </Panel>
          </View>
        </Modal>

        {/* Game Over Modal */}
        <Modal
          visible={showGameOver}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGameOver(false)}
        >
          <View style={styles.modalOverlay}>
            <Panel size="medium" style={styles.gameOverContent}>
              <CloseButton 
                onPress={() => setShowGameOver(false)} 
                style={{ position: 'absolute', top: 10, right: 10 }}
              />
              <Text style={styles.gameOverTitle}>Lightning Round Complete!</Text>
              <Text style={styles.finalScore}>{score.toLocaleString()}</Text>
              
              <View style={styles.achievements}>
                <CustomTextBox style={styles.achievement}>
                  <Text style={styles.achievementText}>Max Streak: {streak}</Text>
                </CustomTextBox>
                <CustomTextBox style={styles.achievement}>
                  <Text style={styles.achievementText}>Puzzles Solved: {solved}</Text>
                </CustomTextBox>
                <CustomTextBox style={styles.achievement}>
                  <Text style={styles.achievementText}>Level Reached: {level}</Text>
                </CustomTextBox>
              </View>
              
              <View style={styles.gameOverButtons}>
                <CustomButton
                  onPress={startGame}
                  text="Play Again"
                  size="large"
                  color="yellow"
                />
              </View>
            </Panel>
          </View>
        </Modal>

        {/* Rules Modal */}
        <Modal
          visible={showRules}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRules(false)}
        >
          <View style={styles.modalOverlay}>
            <Panel size="full" style={styles.modalContent}>
              <CloseButton 
                onPress={() => setShowRules(false)} 
                style={{ position: 'absolute', top: 10, right: 10 }}
              />
              <Text style={styles.modalTitle}>⚡ Lightning Links Rules</Text>
              
              <Text style={styles.ruleText}>🎯 <Text style={styles.boldText}>Goal:</Text> Find a 5-letter bridge word that connects both words</Text>
              
              <CustomTextBox style={styles.diagramContainer}>
                <Text style={styles.diagramTitle}>Letter Sharing Rule:</Text>
                
                <View style={styles.diagramRow}>
                  <Text style={styles.diagramWord}>HEART</Text>
                  <Text style={styles.diagramArrow}>→</Text>
                  <Text style={styles.diagramBridge}>PACER</Text>
                  <Text style={styles.diagramArrow}>→</Text>
                  <Text style={styles.diagramWord}>SPACE</Text>
                </View>
                
                <View style={styles.sharingExample}>
                  <Text style={styles.sharingText}>HEART ↔ PACER: <Text style={styles.sharedLetters}>A, E, R</Text> (3 letters) ✅</Text>
                  <Text style={styles.sharingText}>PACER ↔ SPACE: <Text style={styles.sharedLetters}>P, A, C, E</Text> (4 letters) ✅</Text>
                </View>
                
                <Text style={styles.ruleHighlight}>Bridge word must share ≥2 letters with BOTH words</Text>
              </CustomTextBox>
              
              <Text style={styles.ruleText}>⏰ <Text style={styles.boldText}>Time:</Text> 30 seconds per puzzle (gets faster as you level up!)</Text>
              <Text style={styles.ruleText}>🏆 <Text style={styles.boldText}>Scoring:</Text> Base 100 + time bonus + streak multiplier + level bonus</Text>
              
              <CustomButton
                onPress={() => setShowRules(false)}
                text="Got it!"
                size="small"
                color="purple"
                style={{ marginTop: 20 }}
              />
            </Panel>
          </View>
        </Modal>
        </SafeAreaView>
        </ImageBackground>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#ff8a00', // Orange background color
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gameBoard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 0,
    paddingHorizontal: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 2,
    marginTop: -5,
    paddingHorizontal: 10,
    position: 'relative',
  },
  logoImage: {
    width: 450,
    height: 160,
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
  letterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  letterTile: {
    backgroundColor: '#ffd54f',
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
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
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
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
  loadingFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
  rulesButtonText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: 'bold',
  },
});