import { Platform } from 'react-native';
import DailyChallengeService from './DailyChallengeService';
import UserProfileService from './UserProfileService';

/**
 * DailyChallengeTracker - Progress tracking during gameplay
 * Handles real-time challenge progress updates and completion detection
 */
class DailyChallengeTracker {
  constructor() {
    this.isTracking = false;
    this.currentGameData = null;
    this.wordsUsed = [];
    this.gameStartTime = null;
    this.solveTimes = [];
  }

  /**
   * Start tracking a new game
   */
  startTracking() {
    this.isTracking = true;
    this.currentGameData = {
      finalScore: 0,
      streak: 0,
      wordsUsed: 0,
      solveTime: 0,
      perfectGame: false,
      won: false
    };
    this.wordsUsed = [];
    this.gameStartTime = Date.now();
    this.solveTimes = [];
    
    console.log('🎯 Started tracking daily challenges');
  }

  /**
   * Stop tracking current game
   */
  stopTracking() {
    this.isTracking = false;
    console.log('🎯 Stopped tracking daily challenges');
  }

  /**
   * Track word usage for challenges
   */
  trackWordUsed(word) {
    if (!this.isTracking) return;
    
    this.wordsUsed.push(word);
    this.currentGameData.wordsUsed = this.wordsUsed.length;
    
    console.log(`📝 Tracked word: ${word} (${this.wordsUsed.length} total)`);
  }

  /**
   * Track puzzle solve time
   */
  trackSolveTime(solveTime) {
    if (!this.isTracking) return;
    
    this.solveTimes.push(solveTime);
    this.currentGameData.solveTime = solveTime;
    
    console.log(`⏱️ Tracked solve time: ${solveTime}s`);
  }

  /**
   * Update game score
   */
  updateScore(score) {
    if (!this.isTracking) return;
    
    this.currentGameData.finalScore = score;
    console.log(`📊 Updated score: ${score}`);
  }

  /**
   * Update streak
   */
  updateStreak(streak) {
    if (!this.isTracking) return;
    
    this.currentGameData.streak = streak;
    console.log(`🔥 Updated streak: ${streak}`);
  }

  /**
   * Mark game as won/lost
   */
  setGameResult(won, perfectGame = false) {
    if (!this.isTracking) return;
    
    this.currentGameData.won = won;
    this.currentGameData.perfectGame = perfectGame;
    
    console.log(`🎮 Game result: ${won ? 'WON' : 'LOST'}, Perfect: ${perfectGame}`);
  }

  /**
   * Complete current game and update challenge progress
   */
  async completeGame() {
    if (!this.isTracking) return null;
    
    try {
      console.log('🎯 Completing game and updating challenges...');
      
      // Update challenge progress
      const updatedChallenges = await DailyChallengeService.updateChallengeProgress(
        this.currentGameData,
        this.wordsUsed
      );
      
      // Update challenge streak if any challenges were completed
      const hasCompleted = updatedChallenges.some(c => c.completed);
      if (hasCompleted) {
        await DailyChallengeService.updateChallengeStreak();
      }
      
      // Award coins and XP for completed challenges
      await this.awardChallengeRewards(updatedChallenges);
      
      this.stopTracking();
      return updatedChallenges;
      
    } catch (error) {
      console.error('❌ Failed to complete game tracking:', error);
      this.stopTracking();
      return null;
    }
  }

  /**
   * Award rewards for completed challenges
   */
  async awardChallengeRewards(challenges) {
    try {
      const completedChallenges = challenges.filter(c => c.completed && !c.claimed);
      
      for (const challenge of completedChallenges) {
        // Award coins and XP
        if (UserProfileService.isServiceInitialized?.()) {
          await UserProfileService.addCoins(challenge.reward.coins);
          // XP is handled through the game stats update
        }
        
        console.log(`🎁 Awarded ${challenge.reward.coins} coins for ${challenge.name}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to award challenge rewards:', error);
    }
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      gameData: this.currentGameData,
      wordsUsed: this.wordsUsed,
      solveTimes: this.solveTimes
    };
  }

  /**
   * Get current challenge progress
   */
  async getCurrentProgress() {
    try {
      if (!DailyChallengeService.isServiceInitialized()) {
        return [];
      }
      
      return await DailyChallengeService.getTodaysChallenges();
    } catch (error) {
      console.error('❌ Failed to get current progress:', error);
      return [];
    }
  }

  /**
   * Check if any challenges are close to completion
   */
  async getNearCompletionChallenges() {
    try {
      const challenges = await this.getCurrentProgress();
      return challenges.filter(c => {
        const progress = c.progress / c.target;
        return progress >= 0.8 && !c.completed; // 80% or more complete
      });
    } catch (error) {
      console.error('❌ Failed to get near completion challenges:', error);
      return [];
    }
  }

  /**
   * Get challenge notifications for current game state
   */
  async getChallengeNotifications() {
    try {
      const challenges = await this.getCurrentProgress();
      const notifications = [];
      
      for (const challenge of challenges) {
        if (challenge.completed && !challenge.claimed) {
          notifications.push({
            type: 'completed',
            challenge,
            message: `Challenge completed: ${challenge.name}!`
          });
        } else if (!challenge.completed) {
          const progress = (challenge.progress / challenge.target) * 100;
          if (progress >= 80) {
            notifications.push({
              type: 'near_completion',
              challenge,
              message: `Almost there! ${challenge.name} is ${Math.round(progress)}% complete`
            });
          }
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('❌ Failed to get challenge notifications:', error);
      return [];
    }
  }

  /**
   * Track specific challenge types during gameplay
   */
  trackSpeedRun(solveTime) {
    this.trackSolveTime(solveTime);
  }

  trackStreakMaster(streak) {
    this.updateStreak(streak);
  }

  trackPerfectGame(hasMistakes) {
    this.setGameResult(true, !hasMistakes);
  }

  trackLetterHunter(word) {
    this.trackWordUsed(word);
  }

  trackWordCount() {
    // Word count is automatically tracked via trackWordUsed
    return this.wordsUsed.length;
  }

  trackScoreTarget(score) {
    this.updateScore(score);
  }

  /**
   * Get challenge hints for current game
   */
  async getChallengeHints() {
    try {
      const challenges = await this.getCurrentProgress();
      const hints = [];
      
      for (const challenge of challenges) {
        if (!challenge.completed) {
          switch (challenge.type) {
            case 'SPEED_RUN':
              hints.push({
                type: 'speed',
                message: `Solve puzzles quickly! Need ${challenge.target - challenge.progress} more under 20s`,
                color: challenge.color
              });
              break;
              
            case 'LETTER_HUNTER':
              const targetLetter = 'Q'; // This should come from challenge config
              hints.push({
                type: 'letter',
                message: `Use words with '${targetLetter}'! Need ${challenge.target - challenge.progress} more`,
                color: challenge.color
              });
              break;
              
            case 'STREAK_MASTER':
              hints.push({
                type: 'streak',
                message: `Build your streak! Best so far: ${challenge.progress}`,
                color: challenge.color
              });
              break;
          }
        }
      }
      
      return hints;
    } catch (error) {
      console.error('❌ Failed to get challenge hints:', error);
      return [];
    }
  }
}

// Export singleton instance
export default new DailyChallengeTracker();
