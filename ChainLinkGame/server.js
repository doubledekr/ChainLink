// Real-time multiplayer server for ChainLink
// Run with: node server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Expo
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

class ChainLinkMultiplayerServer {
  constructor() {
    this.waitingPlayers = [];
    this.activeMatches = new Map();
    this.players = new Map();
  }

  addPlayer(socket, playerData) {
    console.log(`🎮 Player joined: ${playerData.playerId} (${playerData.playerName})`);
    
    this.players.set(socket.id, {
      socket: socket,
      playerId: playerData.playerId,
      playerName: playerData.playerName,
      joinTime: Date.now()
    });

    socket.emit('player_registered', {
      success: true,
      playerId: playerData.playerId
    });
  }

  addPlayerToQueue(socket, playerData) {
    console.log(`🔍 Adding player to matchmaking queue: ${playerData.playerId}`);
    
    this.waitingPlayers.push({
      socket: socket,
      playerId: playerData.playerId,
      playerName: playerData.playerName,
      skillLevel: playerData.skillLevel || 1000,
      joinTime: Date.now()
    });

    console.log(`📊 Queue size: ${this.waitingPlayers.length}`);
    this.tryCreateMatch();
  }

  tryCreateMatch() {
    if (this.waitingPlayers.length >= 2) {
      const player1 = this.waitingPlayers.shift();
      const player2 = this.waitingPlayers.shift();

      const matchId = this.generateMatchId();
      const puzzle = this.generatePuzzle();
      
      const match = {
        id: matchId,
        players: [player1, player2],
        startTime: Date.now(),
        currentRound: 1,
        maxRounds: 5,
        puzzle: puzzle,
        scores: { [player1.playerId]: 0, [player2.playerId]: 0 }
      };

      this.activeMatches.set(matchId, match);

      console.log(`🎯 Match created: ${matchId} with players ${player1.playerName} vs ${player2.playerName}`);

      // Notify both players
      const matchData = {
        matchId: matchId,
        opponent: { 
          playerId: player2.playerId, 
          displayName: player2.playerName 
        },
        puzzle: puzzle,
        round: 1,
        maxRounds: 5
      };

      player1.socket.emit('match_found', {
        ...matchData,
        opponent: { 
          playerId: player2.playerId, 
          displayName: player2.playerName 
        }
      });

      player2.socket.emit('match_found', {
        ...matchData,
        opponent: { 
          playerId: player1.playerId, 
          displayName: player1.playerName 
        }
      });

      // Join both players to match room
      player1.socket.join(matchId);
      player2.socket.join(matchId);

      console.log(`✅ Match started: ${player1.playerName} vs ${player2.playerName}`);
    }
  }

  handleGameMove(socket, moveData) {
    const player = this.players.get(socket.id);
    if (!player) return;

    console.log(`🎮 Game move from ${player.playerName}:`, moveData.type);

    // Find the match this player is in
    let matchId = null;
    for (const [id, match] of this.activeMatches) {
      if (match.players.some(p => p.playerId === player.playerId)) {
        matchId = id;
        break;
      }
    }

    if (!matchId) {
      console.log('❌ No active match found for player');
      return;
    }

    const match = this.activeMatches.get(matchId);

    // Handle different move types
    switch (moveData.type) {
      case 'round_won':
        this.handleRoundWin(matchId, player.playerId, moveData);
        break;
      case 'match_completed':
        this.handleMatchEnd(matchId, moveData);
        break;
      default:
        // Broadcast move to opponent
        socket.to(matchId).emit('opponent_move', {
          ...moveData,
          playerId: player.playerId,
          playerName: player.playerName
        });
    }
  }

  handleRoundWin(matchId, winnerId, moveData) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    console.log(`🏆 Round ${moveData.round} won by ${winnerId} with word: ${moveData.word}`);

    // Update scores
    match.scores[winnerId]++;
    
    // Broadcast round result to both players
    this.io.to(matchId).emit('opponent_move', {
      type: 'round_won',
      word: moveData.word,
      round: moveData.round,
      winner: winnerId,
      scores: match.scores
    });

    // Check if match is complete
    if (moveData.round >= match.maxRounds) {
      this.handleMatchEnd(matchId, { 
        finalScores: match.scores,
        totalRounds: match.maxRounds 
      });
    }
  }

  handleMatchEnd(matchId, resultData) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    console.log(`🏁 Match ${matchId} ended`);

    // Broadcast match end to both players
    this.io.to(matchId).emit('opponent_move', {
      type: 'match_completed',
      ...resultData
    });

    // Clean up match
    this.activeMatches.delete(matchId);
  }

  handleDisconnect(socket) {
    const player = this.players.get(socket.id);
    if (player) {
      console.log(`👋 Player disconnected: ${player.playerName}`);
      
      // Remove from waiting queue
      this.waitingPlayers = this.waitingPlayers.filter(p => p.socket.id !== socket.id);
      
      // Handle active match disconnection
      for (const [matchId, match] of this.activeMatches) {
        if (match.players.some(p => p.playerId === player.playerId)) {
          console.log(`🚫 Player left active match: ${matchId}`);
          // Notify opponent
          socket.to(matchId).emit('opponent_disconnected');
          this.activeMatches.delete(matchId);
          break;
        }
      }
      
      this.players.delete(socket.id);
    }
  }

  generateMatchId() {
    return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generatePuzzle() {
    const puzzles = [
      { start: "TOWER", end: "BEACH" },
      { start: "HEART", end: "SPACE" },
      { start: "STORM", end: "PEACE" },
      { start: "MAGIC", end: "TRUTH" },
      { start: "BRAVE", end: "SMILE" },
      { start: "DREAM", end: "LIGHT" },
      { start: "OCEAN", end: "FLAME" },
      { start: "PLANT", end: "CROWN" }
    ];
    
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  }
}

const gameServer = new ChainLinkMultiplayerServer();
gameServer.io = io; // Store io reference for broadcasting

io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  socket.on('register_player', (playerData) => {
    gameServer.addPlayer(socket, playerData);
  });

  socket.on('find_match', (playerData) => {
    gameServer.addPlayerToQueue(socket, playerData);
  });

  socket.on('game_move', (moveData) => {
    gameServer.handleGameMove(socket, moveData);
  });

  socket.on('disconnect', () => {
    gameServer.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ChainLink Multiplayer Server running on port ${PORT}`);
  console.log(`📱 Connect your Expo apps to this server!`);
});
