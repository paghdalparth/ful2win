const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const gameRoutes = require('./routes/gameRoutes');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/auth');
const protected = require('./routes/protected');
const MatchmakingQueue = require('./models/MatchmakingQueue');
const Room = require('./models/Room');
const chatRoutes = require('./routes/chat');

const ticTacToeGameRoutes = require('./routes/ticTacToeGame');
const rockPaperGameRoutes = require('./routes/rockPaperGameRoutes');
const cardDrawGameRoutes = require('./routes/cardDrawGameRoutes');
const userRoutes = require('./routes/userRoutes');
const DuckHunt = require('./models/DuckHunt');
const CardDrawGame = require('./models/CardDrawGame');
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","http://localhost:5173" , "https://ful2win.onrender.com"],  // Your deployed frontend URL
    methods: ["GET", "POST", "PUT"],
  },
});

console.log('=== Backend started! (CardDrawGame debug) ===');

// Middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173" , "https://ful2win.onrender.com"]
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect MongoDB
require('./config/db')();

// API Routes
app.use('/api/game', gameRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/protected', protected);
app.use('/api/chat', chatRoutes);
app.use('/api/tictactoe', ticTacToeGameRoutes);
app.use('/api/rockpaper', rockPaperGameRoutes);
app.use('/api/carddraw', cardDrawGameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/duckhunt', DuckHunt); // secured routes

// Socket.IO Connection

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_matchmaking', async ({ userId, gameId }) => {
    try {
      // Check for existing player in queue
      const opponent = await MatchmakingQueue.findOne({ gameId, userId: { $ne: userId } });

      if (opponent) {
        // Match found – remove both from queue
        await MatchmakingQueue.deleteOne({ _id: opponent._id });

        const newRoom = await Room.create({
          gameId,
          players: [
            { userId: opponent.userId, socketId: opponent.socketId },
            { userId, socketId: socket.id }
          ],
          status: 'in-progress'
        });

        // --- Card Draw War: Create CardDrawGame document when match is found ---
        console.log('Match found for gameId:', gameId, typeof gameId);
        if (gameId === 'carddraw') {
          try {
            console.log('Trying to create CardDrawGame for room:', newRoom._id.toString());
            let doc = await CardDrawGame.create({
              roomId: newRoom._id.toString(),
              players: [
                { userId: newRoom.players[0].userId, score: 0 },
                { userId: newRoom.players[1].userId, score: 0 }
              ],
              status: 'waiting',
              rounds: [
                { roundNumber: 1, status: 'pending' },
                { roundNumber: 2, status: 'pending' },
                { roundNumber: 3, status: 'pending' }
              ],
              currentRound: 1
            });
            console.log('CardDrawGame created:', doc);

            // Have both players join the room
            socket.join(newRoom._id.toString());
            io.sockets.sockets.get(opponent.socketId)?.join(newRoom._id.toString());
            console.log(`Socket ${socket.id} and ${opponent.socketId} joined room ${newRoom._id.toString()}`);

            // Update game status to ongoing and save
            doc.status = 'ongoing';
            await doc.save();
            console.log('CardDrawGame status updated to ongoing:', doc);

            // Emit the updated game state to the room
            io.to(newRoom._id.toString()).emit('game_state_updated', doc);
            console.log('Emitted game_state_updated to room:', newRoom._id.toString(), doc);

            // Notify both players of the match
            socket.emit('match_found', { roomId: newRoom._id, players: newRoom.players });
            io.to(opponent.socketId).emit('match_found', { roomId: newRoom._id, players: newRoom.players });

          } catch (err) {
            console.error('Error creating or starting CardDrawGame:', err);
            // Consider emitting an error event to the players here
             socket.emit('matchmaking_error', 'Error starting game');
             io.to(opponent.socketId).emit('matchmaking_error', 'Error starting game');
          }
        } else {
          console.log('gameId did not match "carddraw", got:', gameId);
           // Existing logic for other game types if any
           // Notify both players of the match for other games
           socket.emit('match_found', { roomId: newRoom._id, players: newRoom.players });
           io.to(opponent.socketId).emit('match_found', { roomId: newRoom._id, players: newRoom.players });
        }

      } else {
        // No opponent found yet, add to queue
        await MatchmakingQueue.create({ userId, gameId, socketId: socket.id });
        socket.emit('waiting_for_opponent');
      }
    } catch (err) {
      console.error('Matchmaking error:', err);
      socket.emit('matchmaking_error', 'An error occurred');
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    // Remove from matchmaking queue on disconnect
    await MatchmakingQueue.deleteOne({ socketId: socket.id });
  });
});


// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

