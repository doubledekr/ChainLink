import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import WordDisplay from '../game/WordDisplay';
import Keyboard from '../game/Keyboard';
import ScoreDisplay from '../game/ScoreDisplay';
import Timer from '../game/Timer';
import FeedbackDisplay from '../ui/FeedbackDisplay';

const GameScreen = ({ 
  gameState, 
  timer, 
  animations,
  onKeyPress, 
  onSkipPuzzle, 
  onShowRules 
}) => {
  const {
    startWord,
    currentWord,
    endWord,
    error,
    score,
    streak,
    solved,
    roundsRemaining,
    bonusRounds,
    showStreak
  } = gameState;

  const {
    timeRemaining,
    initialTime,
    getTimeBasedBonus
  } = timer;

  const {
    confirmAnim,
    keyPressAnim,
    streakAnim,
    successMessageAnim
  } = animations;

  return (
    <View style={globalStyles.gameBoard}>
      {/* Header Section */}
      <View style={globalStyles.headerContainer}>
        <TouchableOpacity 
          onPress={onShowRules}
          activeOpacity={0.7}
          style={globalStyles.rulesButton}
        >
          <Text style={globalStyles.rulesButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <ScoreDisplay 
        score={score}
        streak={streak}
        solved={solved}
        roundsRemaining={roundsRemaining}
        bonusRounds={bonusRounds}
      />

      {/* Timer with Progress Bar */}
      <Timer 
        gameActive={true}
        timeRemaining={timeRemaining}
        initialTime={initialTime}
        getTimeBasedBonus={getTimeBasedBonus}
      />
      
      {/* Game Words */}
      <WordDisplay
        startWord={startWord}
        currentWord={currentWord}
        endWord={endWord}
        error={error}
        confirmAnim={confirmAnim}
        showStreak={showStreak}
        streak={streak}
        streakAnim={streakAnim}
      />

      {/* Fixed Height Feedback Area */}
      <FeedbackDisplay
        gameActive={true}
        error={error}
        timeRemaining={timeRemaining}
        initialTime={initialTime}
        level={gameState.level}
        streak={streak}
        successMessageAnim={successMessageAnim}
      />

      {/* Fixed Height Controls Area */}
      <View style={globalStyles.controlsContainer}>
        <TouchableOpacity 
          style={globalStyles.simpleButton}
          onPress={onSkipPuzzle}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.simpleButtonText}>Skip (-50 pts)</Text>
        </TouchableOpacity>
      </View>

      {/* Keyboard */}
      <Keyboard
        onKeyPress={onKeyPress}
        keyPressed={gameState.keyPressed}
        keyPressAnim={keyPressAnim}
      />
    </View>
  );
};

export default GameScreen;
