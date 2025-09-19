// MultiplayerManager.js
// Cross-platform multiplayer manager for ChainLink game

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

// Mock Game Center manager for now - will be replaced with actual implementation
class MockGameCenterManager {
  constructor() {
    this.isAuthenticated = false;
    this.localPlayer = null;
  }

  async initialize() {
    try {
      // Mock authentication - replace with actual Game Center implementation
      this.localPlayer = {
        playerId: 'mock_player_' + Math.random().toString(36).substr(2, 9),
        displayName: 'Player ' + Math.floor(Math.random() * 1000),
        avatar: null
      };
      this.isAuthenticated = true;
      console.log('Mock Game Center authenticated:', this.localPlayer.displayName);
      return true;
    } catch (error) {
      console.log('Mock Game Center authentication failed:', error);
      return false;
    }
  }

  async submitScore(score, leaderboardId = 'chainlink_high_scores') {
    if (!this.isAuthenticated) return false;
    
    try {
      console.log('Mock submitting score:', score, 'to leaderboard:', leaderboardId);
      // Store score locally for now
      await AsyncStorage.setItem(`score_${leaderboardId}`, score.toString());
      return true;
    } catch (error) {
      console.log('Mock score submission failed:', error);
      return false;
    }
  }

  async unlockAchievement(achievementId, percentComplete = 100) {
    if (!this.isAuthenticated) return false;
    
    try {
      console.log('Mock unlocking achievement:', achievementId, percentComplete + '%');
      await AsyncStorage.setItem(`achievement_${achievementId}`, percentComplete.toString());
      return true;
    } catch (error) {
      console.log('Mock achievement unlock failed:', error);
      return false;
    }
  }

  async showLeaderboard(leaderboardId = 'chainlink_high_scores') {
    if (!this.isAuthenticated) return;
    console.log('Mock showing leaderboard:', leaderboardId);
    // In real implementation, this would show Game Center leaderboard
  }

  async findMatch(minPlayers = 2, maxPlayers = 2) {
    if (!this.isAuthenticated) return null;
    
    try {
      console.log('Mock finding match...');
      // Simulate finding match after delay
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockOpponent = {
            playerId: 'opponent_' + Math.random().toString(36).substr(2, 9),
            displayName: 'ChainMaster' + Math.floor(Math.random() * 100),
            avatar: null
          };
          resolve({
            matchId: 'match_' + Date.now(),
            players: [this.localPlayer, mockOpponent],
            opponent: mockOpponent
          });
        }, 2000);
      });
    } catch (error) {
      console.log('Mock find match failed:', error);
      return null;
    }
  }

  async sendDataToAllPlayers(data) {
    try {
      console.log('Mock sending data to players:', data);
      // In real implementation, this would send via Game Center
      return true;
    } catch (error) {
      console.log('Mock send data failed:', error);
      return false;
    }
  }
}

// Mock Google Play Games manager
class MockGooglePlayGamesManager {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  async initialize() {
    try {
      this.currentUser = {
        user: {
          id: 'mock_google_player_' + Math.random().toString(36).substr(2, 9),
          name: 'Android Player ' + Math.floor(Math.random() * 1000),
          photo: null
        }
      };
      this.isAuthenticated = true;
      console.log('Mock Google Play Games authenticated:', this.currentUser.user.name);
      return true;
    } catch (error) {
      console.log('Mock Google Play Games authentication failed:', error);
      return false;
    }
  }

  async submitScore(score, leaderboardId) {
    if (!this.isAuthenticated) return false;
    
    try {
      console.log('Mock submitting score to Google Play:', score, leaderboardId);
      await AsyncStorage.setItem(`google_score_${leaderboardId}`, score.toString());
      return true;
    } catch (error) {
      console.log('Mock Google Play score submission failed:', error);
      return false;
    }
  }

  async unlockAchievement(achievementId) {
    if (!this.isAuthenticated) return false;
    
    try {
      console.log('Mock unlocking Google Play achievement:', achievementId);
      await AsyncStorage.setItem(`google_achievement_${achievementId}`, 'unlocked');
      return true;
    } catch (error) {
      console.log('Mock Google Play achievement unlock failed:', error);
      return false;
    }
  }

  async showLeaderboard(leaderboardId) {
    if (!this.isAuthenticated) return;
    console.log('Mock showing Google Play leaderboard:', leaderboardId);
  }
}

class MultiplayerManager {
  constructor() {
    this.gameService = Platform.OS === 'ios' ? new MockGameCenterManager() : new MockGooglePlayGamesManager();
    this.socket = null;
    this.currentMatch = null;
    this.isInMatch = false;
    this.matchCallbacks = {};
  }

  async initialize() {
    try {
      // Initialize platform-specific game service
      const success = await this.gameService.initialize();
      
      if (success) {
        console.log('✅ Multiplayer Manager initialized successfully');
        // Note: Socket connection would be established here for custom backend
        // this.socket = io('wss://your-multiplayer-server.com');
        // this.setupSocketListeners();
      }
      
      return success;
    } catch (error) {
      console.log('❌ Multiplayer Manager initialization failed:', error);
      return false;
    }
  }

  setCallbacks(callbacks) {
    this.matchCallbacks = callbacks;
  }

  async findQuickMatch() {
    try {
      console.log('🔍 Finding quick match...');
      
      if (Platform.OS === 'ios') {
        // Use Game Center matchmaking
        const match = await this.gameService.findMatch(2, 2);
        if (match) {
          this.currentMatch = match;
          this.isInMatch = true;
          
          // Notify callback
          if (this.matchCallbacks.onMatchFound) {
            this.matchCallbacks.onMatchFound(match);
          }
          
          return match;
        }
      } else {
        // Use Google Play Games or custom matchmaking
        const match = await this.gameService.findMatch?.(2, 2);
        if (match) {
          this.currentMatch = match;
          this.isInMatch = true;
          
          if (this.matchCallbacks.onMatchFound) {
            this.matchCallbacks.onMatchFound(match);
          }
          
          return match;
        }
      }
      
      return null;
    } catch (error) {
      console.log('❌ Find match failed:', error);
      return null;
    }
  }

  async sendGameMove(moveData) {
    if (!this.isInMatch || !this.currentMatch) return false;

    const gameMove = {
      playerId: this.getPlayerId(),
      matchId: this.currentMatch.matchId,
      timestamp: Date.now(),
      ...moveData
    };

    try {
      if (Platform.OS === 'ios' && this.gameService.sendDataToAllPlayers) {
        // Send via Game Center
        await this.gameService.sendDataToAllPlayers(gameMove);
      } else if (this.socket) {
        // Send via socket (custom backend)
        this.socket.emit('game_move', gameMove);
      } else {
        // Mock sending - simulate opponent response
        console.log('📤 Mock sending move:', gameMove);
        this.simulateOpponentResponse(gameMove);
      }
      
      return true;
    } catch (error) {
      console.log('❌ Send game move failed:', error);
      return false;
    }
  }

  // Mock opponent responses for testing
  simulateOpponentResponse(playerMove) {
    if (!this.matchCallbacks.onOpponentMove) return;

    setTimeout(() => {
      let mockResponse;
      
      switch (playerMove.type) {
        case 'word_submitted':
          mockResponse = {
            type: 'word_submitted',
            word: this.getRandomWord(),
            time: Math.random() * 15 + 5, // Random time between 5-20 seconds
            score: Math.floor(Math.random() * 300) + 100,
            playerId: this.currentMatch?.opponent?.playerId || 'mock_opponent'
          };
          break;
          
        case 'game_completed':
          mockResponse = {
            type: 'game_completed',
            finalScore: Math.floor(Math.random() * 1000) + 500,
            totalTime: Math.random() * 30 + 60,
            playerId: this.currentMatch?.opponent?.playerId || 'mock_opponent'
          };
          break;
          
        default:
          return;
      }
      
      this.matchCallbacks.onOpponentMove(mockResponse);
    }, 1000 + Math.random() * 3000); // Random delay 1-4 seconds
  }

  getRandomWord() {
    const words = ['WATER', 'REACH', 'EARTH', 'CHART', 'PEACE', 'CREAM', 'STEAM', 'TRACE', 'MATCH', 'TEACH'];
    return words[Math.floor(Math.random() * words.length)];
  }

  async submitMatchResult(score, won) {
    try {
      // Submit to leaderboards
      await this.gameService.submitScore(score);
      
      // Unlock achievements
      if (won) {
        await this.gameService.unlockAchievement('multiplayer_win');
      }
      
      // Store match history
      await this.storeMatchHistory({
        matchId: this.currentMatch?.matchId,
        score: score,
        won: won,
        opponent: this.currentMatch?.opponent,
        timestamp: Date.now()
      });
      
      console.log('✅ Match result submitted:', { score, won });
      return true;
    } catch (error) {
      console.log('❌ Submit match result failed:', error);
      return false;
    }
  }

  async storeMatchHistory(matchData) {
    try {
      const history = await this.getMatchHistory();
      history.push(matchData);
      
      // Keep only last 50 matches
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      await AsyncStorage.setItem('match_history', JSON.stringify(history));
    } catch (error) {
      console.log('❌ Store match history failed:', error);
    }
  }

  async getMatchHistory() {
    try {
      const history = await AsyncStorage.getItem('match_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.log('❌ Get match history failed:', error);
      return [];
    }
  }

  getPlayerId() {
    return this.gameService.localPlayer?.playerId || 
           this.gameService.currentUser?.user?.id || 
           'anonymous_' + Math.random().toString(36).substr(2, 9);
  }

  getPlayerName() {
    return this.gameService.localPlayer?.displayName || 
           this.gameService.currentUser?.user?.name || 
           'Anonymous Player';
  }

  endMatch() {
    this.isInMatch = false;
    this.currentMatch = null;
    console.log('🏁 Match ended');
  }

  // Leaderboard and achievements helpers
  async showLeaderboard(type = 'high_scores') {
    const leaderboardIds = {
      high_scores: 'chainlink_high_scores',
      daily_challenge: 'daily_challenge_scores',
      tournament_wins: 'tournament_wins'
    };
    
    await this.gameService.showLeaderboard(leaderboardIds[type]);
  }

  async unlockAchievement(achievementType, value = 1) {
    const achievements = {
      speed_demon: 'speed_demon_achievement',
      chain_master: 'chain_master_achievement', 
      multiplayer_champion: 'multiplayer_champion_achievement',
      first_win: 'first_multiplayer_win',
      streak_master: 'win_streak_achievement'
    };
    
    const achievementId = achievements[achievementType];
    if (achievementId) {
      await this.gameService.unlockAchievement(achievementId, value);
    }
  }
}

export default new MultiplayerManager();
