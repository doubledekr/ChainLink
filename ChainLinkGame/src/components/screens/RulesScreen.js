import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { screenStyles } from '../../styles/screenStyles';
import { globalStyles } from '../../styles/globalStyles';

const RulesScreen = ({ gameState, onClose }) => {
  return (
    <View style={screenStyles.fullscreenOverlay}>
      <View style={screenStyles.rulesScreen}>
        <View style={screenStyles.rulesHeader}>
          <Text style={screenStyles.rulesTitle}>How to Play</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={screenStyles.closeButton}
          >
            <Text style={screenStyles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={screenStyles.rulesContent}>
          <Text style={screenStyles.ruleText}>
            <Text style={screenStyles.boldText}>Goal:</Text> Find a 5-letter bridge word that connects both words
          </Text>
          
          <View style={screenStyles.compactExampleContainer}>
            <Text style={screenStyles.compactExampleTitle}>Letter Sharing Rule:</Text>
            
            <View style={screenStyles.exampleRow}>
              <Text style={screenStyles.exampleWord}>HEART</Text>
              <Text style={screenStyles.arrow}>→</Text>
              <Text style={screenStyles.bridgeWord}>PACER</Text>
              <Text style={screenStyles.arrow}>→</Text>
              <Text style={screenStyles.exampleWord}>SPACE</Text>
            </View>
            
            <Text style={screenStyles.compactSharingRule}>
              Bridge word must share ≥2 letters with BOTH words
            </Text>
          </View>
          
          <Text style={screenStyles.ruleText}>
            <Text style={screenStyles.boldText}>Game:</Text> Complete 10 rounds to finish
          </Text>
          <Text style={screenStyles.ruleText}>
            <Text style={screenStyles.boldText}>Bonus:</Text> Perfect streak unlocks bonus rounds
          </Text>
          <Text style={screenStyles.ruleText}>
            <Text style={screenStyles.boldText}>Scoring:</Text> Base 100 + time bonus + streak multiplier
          </Text>
        </View>
        
        <TouchableOpacity 
          style={globalStyles.primaryButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.primaryButtonText}>Got it!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RulesScreen;
