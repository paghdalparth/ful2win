const express = require('express');
const router = express.Router();
const CardDrawGame = require('../models/CardDrawGame');
const mongoose = require('mongoose');

// Create new game
router.post('/create', async (req, res) => {
  try {
    const gameData = {
      ...req.body,
      rounds: [
        { roundNumber: 1, status: 'pending' },
        { roundNumber: 2, status: 'pending' },
        { roundNumber: 3, status: 'pending' }
      ],
      currentRound: 1
    };
    
    const game = await CardDrawGame.create(gameData);
    req.io?.emit('gameCreated', game);
    res.status(201).json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get game by roomId or create if not found
router.get('/room/:roomId', async (req, res) => {
  try {
    let game = await CardDrawGame.findOne({ roomId: req.params.roomId });
    
    if (!game) {
      game = await CardDrawGame.create({
        roomId: req.params.roomId,
        status: 'waiting',
        rounds: [
          { roundNumber: 1, status: 'pending' },
          { roundNumber: 2, status: 'pending' },
          { roundNumber: 3, status: 'pending' }
        ]
      });
      req.io?.emit('gameCreated', game);
    }

    res.status(200).json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign players to game
router.put('/assignPlayers/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { players } = req.body;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ error: 'Invalid game ID' });
    }

    const game = await CardDrawGame.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    game.players = players;
    game.status = 'ongoing';
    game.startTime = new Date();

    await game.save();
    req.io?.emit('playersAssigned', game);
    res.status(200).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update round
router.put('/round/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { roundNumber, playerCard, playerId } = req.body;

    const game = await CardDrawGame.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const round = game.rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return res.status(404).json({ error: 'Round not found' });

    // Determine which player is making the move
    const isPlayer1 = game.players[0].userId.toString() === playerId;
    if (isPlayer1) {
      round.player1Card = playerCard;
    } else {
      round.player2Card = playerCard;
    }

    // If both players have played, determine winner
    if (round.player1Card && round.player2Card) {
      const cardValues = {
        'A': 14, 'K': 13, 'Q': 12, 'J': 11,
        '10': 10, '9': 9, '8': 8, '7': 7,
        '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
      };

      const player1Value = cardValues[round.player1Card];
      const player2Value = cardValues[round.player2Card];

      if (player1Value > player2Value) {
        round.winner = game.players[0].userId;
        game.players[0].score += 1;
      } else if (player2Value > player1Value) {
        round.winner = game.players[1].userId;
        game.players[1].score += 1;
      }

      round.status = 'completed';
      game.currentRound += 1;

      // Check if game is over
      if (game.currentRound > 3) {
        game.status = 'finished';
        game.endTime = new Date();
        
        // Determine overall winner
        if (game.players[0].score > game.players[1].score) {
          game.winner = game.players[0].userId;
        } else if (game.players[1].score > game.players[0].score) {
          game.winner = game.players[1].userId;
        }
      }
    }

    await game.save();
    req.io?.emit('roundUpdated', game);
    res.status(200).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// End game manually
router.put('/end/:gameId', async (req, res) => {
  try {
    const game = await CardDrawGame.findById(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    game.status = 'finished';
    game.endTime = new Date();

    await game.save();
    req.io?.emit('gameEnded', game);
    res.status(200).json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/test-create', async (req, res) => {
  try {
    const doc = await CardDrawGame.create({
      roomId: 'test-room-id',
      players: [
        { userId: '000000000000000000000001', score: 0 },
        { userId: '000000000000000000000002', score: 0 }
      ],
      status: 'waiting',
      rounds: [
        { roundNumber: 1, status: 'pending' },
        { roundNumber: 2, status: 'pending' },
        { roundNumber: 3, status: 'pending' }
      ],
      currentRound: 1
    });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 