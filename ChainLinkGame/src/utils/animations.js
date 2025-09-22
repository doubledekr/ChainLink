import { Animated } from 'react-native';
import { ANIMATIONS } from './constants';

/**
 * Create a key press animation
 * @param {Animated.Value} animatedValue - The animated value to animate
 * @param {Function} onComplete - Callback when animation completes
 */
export const animateKeyPress = (animatedValue, onComplete = null) => {
  Animated.sequence([
    Animated.timing(animatedValue, { 
      toValue: 0.95, 
      duration: ANIMATIONS.KEY_PRESS_DURATION, 
      useNativeDriver: true 
    }),
    Animated.timing(animatedValue, { 
      toValue: 1, 
      duration: ANIMATIONS.KEY_PRESS_DURATION, 
      useNativeDriver: true 
    })
  ]).start(onComplete);
};

/**
 * Create a success confirmation animation
 * @param {Animated.Value} animatedValue - The animated value to animate
 */
export const animateSuccessConfirm = (animatedValue) => {
  Animated.sequence([
    Animated.timing(animatedValue, { 
      toValue: 1.2, 
      duration: ANIMATIONS.CONFIRM_ANIMATION_DURATION, 
      useNativeDriver: true 
    }),
    Animated.timing(animatedValue, { 
      toValue: 1, 
      duration: ANIMATIONS.CONFIRM_ANIMATION_DURATION, 
      useNativeDriver: true 
    })
  ]).start();
};

/**
 * Create a streak animation
 * @param {Animated.Value} animatedValue - The animated value to animate
 * @param {Function} onComplete - Callback when animation completes
 */
export const animateStreak = (animatedValue, onComplete = null) => {
  Animated.sequence([
    Animated.timing(animatedValue, { 
      toValue: 1, 
      duration: ANIMATIONS.STREAK_ANIMATION_DURATION, 
      useNativeDriver: true 
    }),
    Animated.delay(ANIMATIONS.STREAK_ANIMATION_HOLD),
    Animated.timing(animatedValue, { 
      toValue: 0, 
      duration: ANIMATIONS.STREAK_ANIMATION_DURATION, 
      useNativeDriver: true 
    })
  ]).start(onComplete);
};

/**
 * Create a success message animation
 * @param {Animated.Value} animatedValue - The animated value to animate
 */
export const animateSuccessMessage = (animatedValue) => {
  animatedValue.setValue(0);
  
  Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: ANIMATIONS.SUCCESS_MESSAGE_DURATION,
      useNativeDriver: true,
    }),
    Animated.delay(ANIMATIONS.SUCCESS_MESSAGE_HOLD),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: ANIMATIONS.SUCCESS_MESSAGE_DURATION,
      useNativeDriver: true,
    })
  ]).start();
};

/**
 * Create a fade in animation
 * @param {Animated.Value} animatedValue - The animated value to animate
 * @param {number} duration - Animation duration
 * @param {Function} onComplete - Callback when animation completes
 */
export const fadeIn = (animatedValue, duration = 300, onComplete = null) => {
  Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  }).start(onComplete);
};

/**
 * Create a fade out animation
 * @param {Animated.Value} animatedValue - The animated value to animate
 * @param {number} duration - Animation duration
 * @param {Function} onComplete - Callback when animation completes
 */
export const fadeOut = (animatedValue, duration = 300, onComplete = null) => {
  Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  }).start(onComplete);
};

/**
 * Create a scale animation
 * @param {Animated.Value} animatedValue - The animated value to animate
 * @param {number} toValue - Target scale value
 * @param {number} duration - Animation duration
 * @param {Function} onComplete - Callback when animation completes
 */
export const scaleTo = (animatedValue, toValue, duration = 300, onComplete = null) => {
  Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
  }).start(onComplete);
};
