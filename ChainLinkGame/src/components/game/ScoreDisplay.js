import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const ScoreDisplay = ({ 
  score, 
  streak, 
  solved, 
  roundsRemaining, 
  bonusRounds 
}) => {
  // Debug logging
  console.log('📊 ScoreDisplay received:', { score, streak, solved, roundsRemaining, bonusRounds });
  
  return (
    <View style={globalStyles.statsContainer}>
      <View style={globalStyles.stat}>
        <Text style={globalStyles.statNumber}>{score.toLocaleString()}</Text>
        <Text style={globalStyles.statLabel}>Score</Text>
      </View>
      <View style={globalStyles.stat}>
        <Text style={globalStyles.statNumber}>{streak}</Text>
        <Text style={globalStyles.statLabel}>Streak</Text>
      </View>
      <View style={globalStyles.stat}>
        <Text style={globalStyles.statNumber}>{solved}</Text>
        <Text style={globalStyles.statLabel}>Solved</Text>
      </View>
      <View style={globalStyles.stat}>
        <Text style={globalStyles.statNumber}>
          {bonusRounds ? 'BONUS' : roundsRemaining}
        </Text>
        <Text style={globalStyles.statLabel}>
          {bonusRounds ? 'Round' : 'Left'}
        </Text>
      </View>
    </View>
  );
};

export default ScoreDisplay;
