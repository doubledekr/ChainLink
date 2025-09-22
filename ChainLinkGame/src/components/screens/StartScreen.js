import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { screenStyles } from '../../styles/screenStyles';
import { globalStyles } from '../../styles/globalStyles';

const StartScreen = ({ gameState, onStartGame, onShowRules, onMultiplayerMode }) => {
  const { multiplayerInitialized } = gameState;

  return (
    <View style={screenStyles.fullscreenOverlay}>
      <View style={screenStyles.startScreen}>
        <Text style={screenStyles.startTitle}>Lightning Links</Text>
        <Text style={screenStyles.startSubtitle}>Bridge words with lightning speed!</Text>
        
        <View style={screenStyles.startInstructions}>
          <Text style={screenStyles.instructionText}>Complete 10 rounds to finish the game</Text>
          <Text style={screenStyles.instructionText}>Perfect streak? Keep playing bonus rounds!</Text>
          <Text style={screenStyles.instructionText}>One mistake in bonus = game over</Text>
        </View>
        
        <TouchableOpacity 
          style={globalStyles.primaryButton}
          onPress={onStartGame}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.primaryButtonText}>Start Lightning Round</Text>
        </TouchableOpacity>
        
        {multiplayerInitialized && (
          <TouchableOpacity 
            style={globalStyles.multiplayerButton}
            onPress={onMultiplayerMode}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.multiplayerButtonText}>⚡ Multiplayer Battle</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={globalStyles.secondaryButton}
          onPress={onShowRules}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.secondaryButtonText}>How to Play</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StartScreen;
