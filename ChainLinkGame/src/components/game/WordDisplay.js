import React from 'react';
import { View, Text, Animated } from 'react-native';
import { gameStyles } from '../../styles/gameStyles';

const LetterTile = ({ letter, isEmpty = false, isInput = false, error = null, confirmAnim }) => {
  const tileStyle = [
    letter ? gameStyles.letterTile : gameStyles.emptyLetterTile,
    isInput && error === 'invalid' && letter && gameStyles.errorTile,
    isInput && error === 'success' && letter && gameStyles.successTile
  ];

  const animatedStyle = isInput && error === 'success' && letter 
    ? { transform: [{ scale: confirmAnim }] }
    : {};

  return (
    <Animated.View style={[tileStyle, animatedStyle]}>
      <Text style={[
        letter ? gameStyles.letterText : gameStyles.emptyLetterText,
        isInput && error === 'success' && letter && { color: 'white' }
      ]}>
        {letter || '_'}
      </Text>
    </Animated.View>
  );
};

const WordDisplay = ({ 
  startWord, 
  currentWord, 
  endWord, 
  error, 
  confirmAnim,
  showStreak,
  streak,
  streakAnim 
}) => {
  const renderLetterTiles = (word, isInput = false, isEmpty = false) => {
    if (isEmpty) {
      return (
        <View style={gameStyles.wordContainer}>
          <View style={gameStyles.letterRow}>
            {[0, 1, 2, 3, 4].map((index) => (
              <LetterTile key={`empty-${index}`} isEmpty={true} />
            ))}
          </View>
        </View>
      );
    }

    const letters = word.split('');
    const paddedLetters = [...letters];
    while (paddedLetters.length < 5) {
      paddedLetters.push('');
    }

    return (
      <View style={gameStyles.wordContainer}>
        <View style={gameStyles.letterRow}>
          {paddedLetters.slice(0, 5).map((letter, index) => (
            <LetterTile
              key={`${word}-${index}`}
              letter={letter}
              isInput={isInput}
              error={error}
              confirmAnim={confirmAnim}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={gameStyles.puzzleArea}>
      <View style={gameStyles.wordDisplay}>
        {renderLetterTiles(startWord)}
        
        <View style={gameStyles.inputContainer}>
          {currentWord.length > 0 
            ? renderLetterTiles(currentWord, true)
            : renderLetterTiles('', false, true)}
          
          {showStreak && (
            <Animated.View style={[gameStyles.streakOverlay, { opacity: streakAnim }]}>
              <View style={gameStyles.fireEmojiContainer}>
                <Text style={gameStyles.fireEmoji}>🔥</Text>
                <Text style={gameStyles.fireEmoji}>🔥</Text>
                <Text style={gameStyles.fireEmoji}>🔥</Text>
              </View>
              <Text style={gameStyles.streakText}>STREAK x{streak}</Text>
            </Animated.View>
          )}
        </View>
        
        {renderLetterTiles(endWord)}
      </View>
    </View>
  );
};

export default WordDisplay;
