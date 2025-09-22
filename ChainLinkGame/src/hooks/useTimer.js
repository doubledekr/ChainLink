import { useState, useRef, useCallback } from 'react';
import { GAME_CONFIG, TIMER_THRESHOLDS } from '../utils/constants';

export const useTimer = (onTimeOut) => {
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.INITIAL_TIME);
  const [initialTime, setInitialTime] = useState(GAME_CONFIG.INITIAL_TIME);
  const timerInterval = useRef(null);

  /**
   * Start the timer with specified duration
   * @param {number} duration - Timer duration in seconds
   */
  const startTimer = useCallback((duration) => {
    const newTime = duration || Math.max(GAME_CONFIG.MIN_TIME, GAME_CONFIG.INITIAL_TIME);
    setTimeRemaining(newTime);
    setInitialTime(newTime);
    
    // Clear any existing timer
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    console.log(`⏰ Starting timer with ${newTime} seconds`);
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          console.log('⏰ Timer expired! Calling timeout callback');
          clearInterval(timerInterval.current);
          // Use setTimeout to break out of the setInterval callback context
          setTimeout(() => {
            if (onTimeOut) {
              onTimeOut();
            }
          }, 0);
          return 0;
        }
        return newTime;
      });
    }, GAME_CONFIG.TIMER_INTERVAL);
  }, [onTimeOut]);

  /**
   * Stop the timer
   */
  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      console.log('⏰ Stopping timer');
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  /**
   * Get time-based bonus based on remaining time
   * @returns {Object} - Bonus information with points and label
   */
  const getTimeBasedBonus = useCallback(() => {
    const timePercentage = timeRemaining / initialTime;
    
    if (timePercentage > TIMER_THRESHOLDS.SUPER_FAST) {
      return { 
        bonus: 100, 
        label: 'SUPER FAST',
        color: '#ffd700'
      };
    }
    
    if (timePercentage > TIMER_THRESHOLDS.FAST) {
      return { 
        bonus: 50, 
        label: 'FAST',
        color: '#ffd700'
      };
    }
    
    if (timePercentage > TIMER_THRESHOLDS.MEDIUM) {
      return { 
        bonus: 25, 
        label: 'MEDIUM',
        color: '#ffd700'
      };
    }
    
    return { 
      bonus: 0, 
      label: '',
      color: '#ffffff'
    };
  }, [timeRemaining, initialTime]);

  /**
   * Calculate time-based score multiplier
   * @returns {number} - Time bonus points
   */
  const getTimeBonus = useCallback(() => {
    return timeRemaining * GAME_CONFIG.TIMER_INTERVAL / 10; // Convert to seconds
  }, [timeRemaining]);

  /**
   * Check if timer is running
   * @returns {boolean} - True if timer is active
   */
  const isTimerRunning = useCallback(() => {
    return timerInterval.current !== null;
  }, []);

  /**
   * Get remaining time as percentage
   * @returns {number} - Percentage of time remaining (0-100)
   */
  const getTimePercentage = useCallback(() => {
    return (timeRemaining / initialTime) * 100;
  }, [timeRemaining, initialTime]);

  /**
   * Get timer color based on remaining time
   * @returns {string} - Color hex code
   */
  const getTimerColor = useCallback(() => {
    const percentage = getTimePercentage();
    
    if (percentage > 60) return '#00ff88'; // Green
    if (percentage > 30) return '#ff6b35'; // Orange
    return '#ff1744'; // Red
  }, [getTimePercentage]);

  /**
   * Calculate new timer duration based on level
   * @param {number} level - Current game level
   * @returns {number} - Timer duration in seconds
   */
  const calculateTimerDuration = useCallback((level) => {
    return Math.max(GAME_CONFIG.MIN_TIME, GAME_CONFIG.INITIAL_TIME - Math.floor(level / 3));
  }, []);

  /**
   * Reset timer to initial state
   */
  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeRemaining(GAME_CONFIG.INITIAL_TIME);
    setInitialTime(GAME_CONFIG.INITIAL_TIME);
  }, [stopTimer]);

  return {
    // State
    timeRemaining,
    initialTime,
    
    // Actions
    startTimer,
    stopTimer,
    resetTimer,
    
    // Calculations
    getTimeBasedBonus,
    getTimeBonus,
    getTimePercentage,
    getTimerColor,
    calculateTimerDuration,
    
    // Utilities
    isTimerRunning
  };
};
