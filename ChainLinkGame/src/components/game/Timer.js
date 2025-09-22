import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const Timer = ({ 
  gameActive, 
  timeRemaining, 
  initialTime, 
  getTimeBasedBonus 
}) => {
  if (!gameActive) {
    return (
      <View style={globalStyles.timerContainer}>
        <View style={globalStyles.timerMessageContainer}>
          <Text style={globalStyles.timerMessage}>Ready to start!</Text>
        </View>
      </View>
    );
  }

  const timeBasedBonus = getTimeBasedBonus();

  return (
    <View style={globalStyles.timerContainer}>
      <View style={globalStyles.progressBar}>
        <View style={[
          globalStyles.progressFill,
          { width: `${(timeRemaining / initialTime) * 100}%` }
        ]} />
      </View>
      
      {/* Speed Bonus Indicator */}
      <View style={globalStyles.speedBonusContainer}>
        {timeBasedBonus.bonus > 0 && (
          <Text style={globalStyles.speedBonusText}>
            {timeBasedBonus.label} +{timeBasedBonus.bonus}
          </Text>
        )}
      </View>
    </View>
  );
};

export default Timer;
