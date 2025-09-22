import React from 'react';
import { View, Text, Animated } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const FeedbackDisplay = ({ 
  gameActive, 
  error, 
  timeRemaining, 
  initialTime, 
  level, 
  streak,
  successMessageAnim 
}) => {
  if (!gameActive) return null;

  const getSuccessMessage = () => {
    const timeBonus = timeRemaining * 10;
    const speedBonus = timeRemaining > (initialTime * 0.8) ? 100 : 
                      timeRemaining > (initialTime * 0.6) ? 50 : 
                      timeRemaining > (initialTime * 0.4) ? 25 : 0;
    const levelBonus = level * 5;
    const totalPoints = (100 + timeBonus + speedBonus + levelBonus) * Math.min(streak, 10);
    
    return {
      points: totalPoints,
      speedBonus: speedBonus,
      isSuperFast: timeRemaining > (initialTime * 0.8),
      isFast: timeRemaining <= (initialTime * 0.8) && timeRemaining > (initialTime * 0.6),
      isMedium: timeRemaining <= (initialTime * 0.6) && timeRemaining > (initialTime * 0.4)
    };
  };

  if (error === 'invalid') {
    return (
      <View style={globalStyles.feedbackContainer}>
        <View style={globalStyles.feedbackOverlay}>
          <Text style={[globalStyles.feedback, globalStyles.feedbackError]}>
            ❌ Word doesn't bridge both words or isn't valid
          </Text>
        </View>
      </View>
    );
  }

  if (error === 'success') {
    const successData = getSuccessMessage();
    
    return (
      <View style={globalStyles.feedbackContainer}>
        <Animated.View style={[
          globalStyles.animatedSuccessContainer,
          {
            opacity: successMessageAnim,
            transform: [
              {
                translateY: successMessageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, -30],
                }),
              },
              {
                scale: successMessageAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0.7, 1.1, 1],
                }),
              },
            ],
          },
        ]}>
          <Text style={[globalStyles.feedback, globalStyles.feedbackSuccess]}>
            Perfect! +{successData.points.toLocaleString()} points!
            {successData.isSuperFast && " SUPER FAST BONUS!"}
            {successData.isFast && " FAST BONUS!"}
            {successData.isMedium && " SPEED BONUS!"}
          </Text>
        </Animated.View>
      </View>
    );
  }

  return null;
};

export default FeedbackDisplay;
