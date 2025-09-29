import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { screenStyles } from '../../styles/screenStyles';
import { globalStyles } from '../../styles/globalStyles';

const StartScreen = ({ 
  gameState, 
  onStartGame, 
  onShowRules, 
  onMultiplayerMode,
  onShowStore,
  onShowAchievements,
  onShowRewards,
  onShowGameModes
}) => {
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
        
        {/* Feature Buttons */}
        <View style={styles.featureButtons}>
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={onShowGameModes}
            activeOpacity={0.8}
          >
            <Text style={styles.featureButtonText}>🎮 Game Modes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={onShowAchievements}
            activeOpacity={0.8}
          >
            <Text style={styles.featureButtonText}>🏆 Achievements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={onShowRewards}
            activeOpacity={0.8}
          >
            <Text style={styles.featureButtonText}>🎁 Daily Rewards</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={onShowStore}
            activeOpacity={0.8}
          >
            <Text style={styles.featureButtonText}>🛒 Store</Text>
          </TouchableOpacity>
        </View>
        
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

const styles = StyleSheet.create({
  featureButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 10,
  },
  featureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 5,
    marginVertical: 5,
  },
  featureButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StartScreen;
