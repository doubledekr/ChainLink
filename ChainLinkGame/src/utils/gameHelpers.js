import { SCORING, TIMER_THRESHOLDS } from './constants';

/**
 * Calculate the total score for a correct answer
 * @param {number} timeRemaining - Time remaining in seconds
 * @param {number} initialTime - Initial time for the puzzle
 * @param {number} level - Current game level
 * @param {number} streak - Current streak
 * @returns {number} - Total points earned
 */
export const calculateScore = (timeRemaining, initialTime, level, streak) => {
  const timeBonus = timeRemaining * SCORING.TIME_MULTIPLIER;
  const speedBonus = getSpeedBonus(timeRemaining, initialTime);
  const streakMultiplier = Math.min(streak, SCORING.MAX_STREAK_MULTIPLIER);
  const levelBonus = level * SCORING.LEVEL_BONUS_MULTIPLIER;
  
  return (SCORING.BASE_POINTS + timeBonus + speedBonus + levelBonus) * streakMultiplier;
};

/**
 * Get speed bonus based on remaining time
 * @param {number} timeRemaining - Time remaining
 * @param {number} initialTime - Initial time
 * @returns {number} - Speed bonus points
 */
export const getSpeedBonus = (timeRemaining, initialTime) => {
  const timePercentage = timeRemaining / initialTime;
  
  if (timePercentage > TIMER_THRESHOLDS.SUPER_FAST) {
    return SCORING.SPEED_BONUS.SUPER_FAST;
  }
  
  if (timePercentage > TIMER_THRESHOLDS.FAST) {
    return SCORING.SPEED_BONUS.FAST;
  }
  
  if (timePercentage > TIMER_THRESHOLDS.MEDIUM) {
    return SCORING.SPEED_BONUS.MEDIUM;
  }
  
  return 0;
};

/**
 * Get speed bonus label
 * @param {number} timeRemaining - Time remaining
 * @param {number} initialTime - Initial time
 * @returns {string} - Speed bonus label
 */
export const getSpeedBonusLabel = (timeRemaining, initialTime) => {
  const timePercentage = timeRemaining / initialTime;
  
  if (timePercentage > TIMER_THRESHOLDS.SUPER_FAST) {
    return 'SUPER FAST';
  }
  
  if (timePercentage > TIMER_THRESHOLDS.FAST) {
    return 'FAST';
  }
  
  if (timePercentage > TIMER_THRESHOLDS.MEDIUM) {
    return 'MEDIUM';
  }
  
  return '';
};

/**
 * Validate if a word is exactly 5 letters and not the same as start/end words
 * @param {string} word - Word to validate
 * @param {string} startWord - Start word
 * @param {string} endWord - End word
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateWordInput = (word, startWord, endWord) => {
  if (word.length !== 5) {
    return {
      isValid: false,
      error: 'Word must be exactly 5 letters'
    };
  }
  
  if (word === startWord.toUpperCase() || word === endWord.toUpperCase()) {
    return {
      isValid: false,
      error: 'Cannot use start or end words as answer'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Format a number with commas for display
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num) => {
  return num.toLocaleString();
};

/**
 * Get achievement message based on game stats
 * @param {Object} stats - Game statistics
 * @returns {string|null} - Achievement message or null
 */
export const getAchievementMessage = (stats) => {
  const { score, streak, solved, level } = stats;
  
  if (streak >= 10) {
    return '🔥 STREAK MASTER! 🔥';
  }
  
  if (score >= 50000) {
    return '⭐ HIGH SCORER! ⭐';
  }
  
  if (level >= 5) {
    return '🚀 LEVEL UP! 🚀';
  }
  
  if (solved >= 15) {
    return '🎯 PUZZLE SOLVER! 🎯';
  }
  
  return null;
};
