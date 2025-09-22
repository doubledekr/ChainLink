import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { screenStyles } from '../../styles/screenStyles';
import { globalStyles } from '../../styles/globalStyles';

const GameOverScreen = ({ gameState, onPlayAgain }) => {
  const { score, streak, solved, level } = gameState;

  return (
    <View style={screenStyles.fullscreenOverlay}>
      <View style={screenStyles.gameOverScreen}>
        <Text style={screenStyles.gameOverTitle}>Lightning Round Complete!</Text>
        <Text style={screenStyles.finalScore}>{score.toLocaleString()}</Text>
        
        <View style={screenStyles.statsGrid}>
          <View style={screenStyles.statBox}>
            <Text style={screenStyles.statBoxLabel}>Max Streak</Text>
            <Text style={screenStyles.statBoxValue}>{streak}</Text>
          </View>
          <View style={screenStyles.statBox}>
            <Text style={screenStyles.statBoxLabel}>Puzzles Solved</Text>
            <Text style={screenStyles.statBoxValue}>{solved}</Text>
          </View>
          <View style={screenStyles.statBox}>
            <Text style={screenStyles.statBoxLabel}>Level Reached</Text>
            <Text style={screenStyles.statBoxValue}>{level}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={globalStyles.primaryButton}
          onPress={onPlayAgain}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.primaryButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GameOverScreen;
