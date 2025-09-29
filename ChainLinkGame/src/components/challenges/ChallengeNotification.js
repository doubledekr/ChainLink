import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ChallengeNotification - Animated notification for challenge progress
 */
const ChallengeNotification = ({ 
  visible, 
  challenge, 
  message, 
  type = 'progress', 
  onPress, 
  onDismiss,
  autoHide = true,
  duration = 3000 
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      if (autoHide) {
        const timer = setTimeout(() => {
          hideNotification();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideNotification();
    }
  }, [visible, autoHide, duration]);

  /**
   * Hide notification with animation
   */
  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  /**
   * Handle notification press
   */
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    hideNotification();
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = () => {
    if (challenge) {
      return challenge.icon;
    }
    
    switch (type) {
      case 'completed':
        return 'trophy';
      case 'near_completion':
        return 'flame';
      case 'progress':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  /**
   * Get notification color based on type
   */
  const getNotificationColor = () => {
    if (challenge) {
      return challenge.color;
    }
    
    switch (type) {
      case 'completed':
        return '#4CAF50';
      case 'near_completion':
        return '#FFA726';
      case 'progress':
        return '#4A90E2';
      default:
        return '#666';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.notification,
          { borderLeftColor: getNotificationColor() }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor() }
          ]}>
            <Ionicons 
              name={getNotificationIcon()} 
              size={20} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {challenge ? challenge.name : 'Challenge Update'}
            </Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideNotification}
          >
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ChallengeNotification;
