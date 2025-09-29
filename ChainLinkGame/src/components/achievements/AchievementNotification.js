import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * AchievementNotification - Animated achievement unlock notification
 */
const AchievementNotification = ({ 
  achievement, 
  visible, 
  onDismiss,
  style 
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [glowAnim] = useState(new Animated.Value(0));
  const dismissTimeout = useRef(null);

  useEffect(() => {
    if (visible && achievement) {
      showNotification();
    } else {
      hideNotification();
    }

    return () => {
      if (dismissTimeout.current) {
        clearTimeout(dismissTimeout.current);
      }
    };
  }, [visible, achievement]);

  /**
   * Show achievement notification
   */
  const showNotification = () => {
    // Clear any existing timeout
    if (dismissTimeout.current) {
      clearTimeout(dismissTimeout.current);
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      )
    ]).start();

    // Auto-dismiss after 4 seconds
    dismissTimeout.current = setTimeout(() => {
      hideNotification();
    }, 4000);
  };

  /**
   * Hide achievement notification
   */
  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  /**
   * Get achievement rarity color
   */
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FFD700';
      default: return '#666';
    }
  };

  /**
   * Get achievement rarity glow color
   */
  const getRarityGlowColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'rgba(76, 175, 80, 0.3)';
      case 'rare': return 'rgba(33, 150, 243, 0.3)';
      case 'epic': return 'rgba(156, 39, 176, 0.3)';
      case 'legendary': return 'rgba(255, 215, 0, 0.3)';
      default: return 'rgba(102, 102, 102, 0.3)';
    }
  };

  if (!visible || !achievement) {
    return null;
  }

  const rarityColor = getRarityColor(achievement.rarity);
  const glowColor = getRarityGlowColor(achievement.rarity);

  return (
    <Animated.View 
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
            backgroundColor: glowColor
          }
        ]}
      />
      
      <View style={[styles.notification, { borderColor: rarityColor }]}>
        <View style={styles.notificationHeader}>
          <View style={[styles.achievementIcon, { backgroundColor: rarityColor }]}>
            <Ionicons 
              name={achievement.icon} 
              size={24} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
          </View>
          
          <View style={styles.achievementPoints}>
            <Text style={[styles.pointsText, { color: rarityColor }]}>
              {achievement.points}
            </Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>
        
        <View style={styles.notificationFooter}>
          <View style={styles.rewardsContainer}>
            {achievement.rewards && Object.entries(achievement.rewards).map(([type, amount]) => (
              <View key={type} style={styles.rewardItem}>
                <Ionicons 
                  name={getRewardIcon(type)} 
                  size={16} 
                  color={getRewardColor(type)} 
                />
                <Text style={styles.rewardText}>
                  {amount} {getRewardLabel(type)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * Get reward icon
 */
const getRewardIcon = (type) => {
  switch (type) {
    case 'coins': return 'logo-bitcoin';
    case 'hints': return 'bulb';
    case 'lives': return 'heart';
    case 'themes': return 'color-palette';
    case 'avatars': return 'person';
    case 'xp': return 'star';
    default: return 'gift';
  }
};

/**
 * Get reward color
 */
const getRewardColor = (type) => {
  switch (type) {
    case 'coins': return '#FFD700';
    case 'hints': return '#FFD700';
    case 'lives': return '#FF6B6B';
    case 'themes': return '#9C27B0';
    case 'avatars': return '#2196F3';
    case 'xp': return '#4CAF50';
    default: return '#666';
  }
};

/**
 * Get reward label
 */
const getRewardLabel = (type) => {
  switch (type) {
    case 'coins': return 'Coins';
    case 'hints': return 'Hints';
    case 'lives': return 'Lives';
    case 'themes': return 'Themes';
    case 'avatars': return 'Avatars';
    case 'xp': return 'XP';
    default: return type;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 20,
  },
  notification: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#ccc',
  },
  notificationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 12,
    color: '#ccc',
    marginLeft: 4,
  },
});

export default AchievementNotification;
