import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * DailyChallengeService - Daily challenge management
 * Handles challenge generation, progress tracking, and reward distribution
 */
class DailyChallengeService {
  constructor() {
    this.challenges = new Map();
    this.isInitialized = false;
    this.challengeTypes = this.initializeChallengeTypes();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.loadChallenges();
      this.isInitialized = true;
      console.log('DailyChallengeService initialized');
      return true;
    } catch (error) {
      console.error('DailyChallengeService initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize challenge types configuration
   */
  initializeChallengeTypes() {
    return {
      SPEED_RUN: {
        name: 'Speed Demon',
        description: 'Solve 5 puzzles in under 20 seconds each',
        icon: 'flash',
        color: '#FF6B6B',
        validator: (gameData) => gameData.solveTime < 20,
        target: 5,
        reward: { coins: 100, xp: 50 },
        difficulty: 'medium'
      },
      STREAK_MASTER: {
        name: 'Streak Master',
        description: 'Achieve a streak of 10 or more',
        icon: 'flame',
        color: '#FFA726',
        validator: (gameData) => gameData.streak >= 10,
        target: 1,
        reward: { coins: 150, xp: 75 },
        difficulty: 'medium'
      },
      PERFECT_GAME: {
        name: 'Perfect Game',
        description: 'Complete a game without any wrong answers',
        icon: 'star',
        color: '#4CAF50',
        validator: (gameData) => gameData.perfectGame,
        target: 1,
        reward: { coins: 200, xp: 100 },
        difficulty: 'hard'
      },
      LETTER_HUNTER: {
        name: 'Letter Hunter',
        description: 'Use 5 words containing the letter \'Q\'',
        icon: 'search',
        color: '#9C27B0',
        validator: (word) => word.includes('Q'),
        target: 5,
        reward: { coins: 120, xp: 60 },
        difficulty: 'easy'
      },
      WORD_COUNT: {
        name: 'Word Warrior',
        description: 'Use 15 words in a single game',
        icon: 'book',
        color: '#2196F3',
        validator: (gameData) => gameData.wordsUsed >= 15,
        target: 1,
        reward: { coins: 180, xp: 90 },
        difficulty: 'medium'
      },
      SCORE_TARGET: {
        name: 'Score Hunter',
        description: 'Score 1000+ points in a single game',
        icon: 'trophy',
        color: '#FFD700',
        validator: (gameData) => gameData.finalScore >= 1000,
        target: 1,
        reward: { coins: 160, xp: 80 },
        difficulty: 'hard'
      }
    };
  }

  /**
   * Generate today's challenges
   */
  async generateTodaysChallenges() {
    try {
      const today = this.getTodayString();
      const stored = await AsyncStorage.getItem(`daily_challenges_${today}`);
      
      if (stored) {
        const challenges = JSON.parse(stored);
        this.challenges.set(today, challenges);
        return challenges;
      }

      // Generate new challenges for today
      const challenges = this.createRandomChallenges();
      this.challenges.set(today, challenges);
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(`daily_challenges_${today}`, JSON.stringify(challenges));
      
      return challenges;
    } catch (error) {
      console.error('Failed to generate today\'s challenges:', error);
      return this.createDefaultChallenges();
    }
  }

  /**
   * Create random challenges for the day
   */
  createRandomChallenges() {
    const challengeKeys = Object.keys(this.challengeTypes);
    const selectedChallenges = [];
    
    // Always include one easy, one medium, and one hard challenge
    const difficulties = ['easy', 'medium', 'hard'];
    
    difficulties.forEach(difficulty => {
      const availableChallenges = challengeKeys.filter(
        key => this.challengeTypes[key].difficulty === difficulty
      );
      
      if (availableChallenges.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableChallenges.length);
        const selectedKey = availableChallenges[randomIndex];
        const challengeType = this.challengeTypes[selectedKey];
        
        selectedChallenges.push({
          id: `${selectedKey}_${Date.now()}`,
          type: selectedKey,
          ...challengeType,
          progress: 0,
          completed: false,
          claimed: false,
          date: this.getTodayString()
        });
      }
    });

    return selectedChallenges;
  }

  /**
   * Create default challenges if generation fails
   */
  createDefaultChallenges() {
    const defaultTypes = ['STREAK_MASTER', 'WORD_COUNT', 'PERFECT_GAME'];
    
    return defaultTypes.map((type, index) => ({
      id: `default_${type}_${Date.now()}_${index}`,
      type,
      ...this.challengeTypes[type],
      progress: 0,
      completed: false,
      claimed: false,
      date: this.getTodayString()
    }));
  }

  /**
   * Get today's challenges
   */
  async getTodaysChallenges() {
    try {
      const today = this.getTodayString();
      
      if (this.challenges.has(today)) {
        return this.challenges.get(today);
      }
      
      return await this.generateTodaysChallenges();
    } catch (error) {
      console.error('Failed to get today\'s challenges:', error);
      return [];
    }
  }

  /**
   * Update challenge progress
   */
  async updateChallengeProgress(gameData, wordsUsed = []) {
    try {
      const challenges = await this.getTodaysChallenges();
      let updated = false;
      
      for (const challenge of challenges) {
        if (challenge.completed || challenge.claimed) continue;
        
        let progressUpdated = false;
        
        switch (challenge.type) {
          case 'SPEED_RUN':
            if (challenge.validator(gameData)) {
              challenge.progress += 1;
              progressUpdated = true;
            }
            break;
            
          case 'STREAK_MASTER':
            if (challenge.validator(gameData)) {
              challenge.progress = Math.max(challenge.progress, gameData.streak);
              progressUpdated = true;
            }
            break;
            
          case 'PERFECT_GAME':
            if (challenge.validator(gameData)) {
              challenge.progress = 1;
              challenge.completed = true;
              progressUpdated = true;
            }
            break;
            
          case 'LETTER_HUNTER':
            const matchingWords = wordsUsed.filter(word => challenge.validator(word));
            challenge.progress = Math.min(challenge.progress + matchingWords.length, challenge.target);
            if (matchingWords.length > 0) progressUpdated = true;
            break;
            
          case 'WORD_COUNT':
            if (challenge.validator(gameData)) {
              challenge.progress = 1;
              challenge.completed = true;
              progressUpdated = true;
            }
            break;
            
          case 'SCORE_TARGET':
            if (challenge.validator(gameData)) {
              challenge.progress = 1;
              challenge.completed = true;
              progressUpdated = true;
            }
            break;
        }
        
        // Check if challenge is completed
        if (challenge.progress >= challenge.target) {
          challenge.completed = true;
        }
        
        if (progressUpdated) {
          updated = true;
        }
      }
      
      if (updated) {
        await this.saveChallenges(challenges);
      }
      
      return challenges;
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
      return [];
    }
  }

  /**
   * Claim challenge reward
   */
  async claimChallengeReward(challengeId) {
    try {
      const challenges = await this.getTodaysChallenges();
      const challenge = challenges.find(c => c.id === challengeId);
      
      if (!challenge || !challenge.completed || challenge.claimed) {
        return null;
      }
      
      challenge.claimed = true;
      await this.saveChallenges(challenges);
      
      return challenge.reward;
    } catch (error) {
      console.error('Failed to claim challenge reward:', error);
      return null;
    }
  }

  /**
   * Get challenge completion statistics
   */
  async getChallengeStats() {
    try {
      const challenges = await this.getTodaysChallenges();
      const completed = challenges.filter(c => c.completed).length;
      const claimed = challenges.filter(c => c.claimed).length;
      const totalReward = challenges
        .filter(c => c.claimed)
        .reduce((sum, c) => sum + c.reward.coins, 0);
      
      return {
        total: challenges.length,
        completed,
        claimed,
        totalReward,
        completionRate: challenges.length > 0 ? (completed / challenges.length) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to get challenge stats:', error);
      return { total: 0, completed: 0, claimed: 0, totalReward: 0, completionRate: 0 };
    }
  }

  /**
   * Get challenge streak (consecutive days with at least one completed challenge)
   */
  async getChallengeStreak() {
    try {
      const streakData = await AsyncStorage.getItem('daily_challenge_streak');
      if (!streakData) return 0;
      
      const { lastDate, streak } = JSON.parse(streakData);
      const today = this.getTodayString();
      const yesterday = this.getYesterdayString();
      
      // If last completion was yesterday, increment streak
      if (lastDate === yesterday) {
        return streak + 1;
      }
      
      // If last completion was today, keep current streak
      if (lastDate === today) {
        return streak;
      }
      
      // Otherwise, reset streak
      return 0;
    } catch (error) {
      console.error('Failed to get challenge streak:', error);
      return 0;
    }
  }

  /**
   * Update challenge streak
   */
  async updateChallengeStreak() {
    try {
      const challenges = await this.getTodaysChallenges();
      const hasCompleted = challenges.some(c => c.completed);
      
      if (!hasCompleted) return;
      
      const currentStreak = await this.getChallengeStreak();
      const today = this.getTodayString();
      
      await AsyncStorage.setItem('daily_challenge_streak', JSON.stringify({
        lastDate: today,
        streak: currentStreak
      }));
      
      return currentStreak;
    } catch (error) {
      console.error('Failed to update challenge streak:', error);
      return 0;
    }
  }

  /**
   * Save challenges to storage
   */
  async saveChallenges(challenges) {
    try {
      const today = this.getTodayString();
      this.challenges.set(today, challenges);
      await AsyncStorage.setItem(`daily_challenges_${today}`, JSON.stringify(challenges));
    } catch (error) {
      console.error('Failed to save challenges:', error);
    }
  }

  /**
   * Load challenges from storage
   */
  async loadChallenges() {
    try {
      const today = this.getTodayString();
      const stored = await AsyncStorage.getItem(`daily_challenges_${today}`);
      
      if (stored) {
        const challenges = JSON.parse(stored);
        this.challenges.set(today, challenges);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  }

  /**
   * Get today's date as string (YYYY-MM-DD)
   */
  getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date as string (YYYY-MM-DD)
   */
  getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  /**
   * Check if challenges have been reset for today
   */
  async needsReset() {
    try {
      const today = this.getTodayString();
      const lastReset = await AsyncStorage.getItem('daily_challenges_last_reset');
      return lastReset !== today;
    } catch (error) {
      console.error('Failed to check reset status:', error);
      return true;
    }
  }

  /**
   * Reset challenges for new day
   */
  async resetForNewDay() {
    try {
      const today = this.getTodayString();
      await AsyncStorage.setItem('daily_challenges_last_reset', today);
      
      // Clear today's challenges to force regeneration
      this.challenges.delete(today);
      
      // Generate new challenges
      return await this.generateTodaysChallenges();
    } catch (error) {
      console.error('Failed to reset for new day:', error);
      return [];
    }
  }

  /**
   * Get challenge types configuration
   */
  getChallengeTypes() {
    return this.challengeTypes;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized() {
    return this.isInitialized;
  }
}

// Export singleton instance
export default new DailyChallengeService();
