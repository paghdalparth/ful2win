const mongoose = require('mongoose');

const CardDrawGameSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  status: {
    type: String,
    enum: ['waiting', 'ongoing', 'finished'],
    default: 'waiting'
  },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    socketId: String,
    score: { type: Number, default: 0 }
  }],
  currentRound: { type: Number, default: 1 },
  rounds: [{
    roundNumber: Number,
    player1Card: { type: String, default: null },
    player2Card: { type: String, default: null },
    winner: { type: String, default: null },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date },
  endTime: { type: Date }
});

module.exports = mongoose.model('CardDrawGame', CardDrawGameSchema); 