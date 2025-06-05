import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import socket from '../../socekt';
import axios from 'axios';

const CardDrawGameLogic = ({ onGameEnd, practiceMode = false }) => {
  // Game state
  const [game, setGame] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [isPlayer1, setIsPlayer1] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);

  // If practiceMode, use local state for both players
  const [practiceState, setPracticeState] = useState({
    round: 1,
    player1Score: 0,
    player2Score: 0,
    status: 'ongoing',
    rounds: []
  });

  // Get match data from localStorage
  const matchData = localStorage.getItem("match_found");
  const userData = localStorage.getItem("user");
  const parsedMatchData = JSON.parse(matchData);
  const parsedUserData = JSON.parse(userData);
  const roomId = parsedMatchData?.roomId;
  const userId = parsedUserData?._id;

  // Card deck
  const cards = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const [availableCards, setAvailableCards] = useState([...cards]);

  // Initialize game
  useEffect(() => {
    if (practiceMode) return; // skip API logic in practice mode
    const initializeGame = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/carddraw/room/${roomId}`);
        const gameData = response.data;
        setGame(gameData);
        setGameId(gameData._id);
        setIsPlayer1(gameData.players[0].userId === userId);
      } catch (error) {
        console.error('Error initializing game:', error);
      }
    };

    if (roomId && userId) {
      initializeGame();
    }
  }, [roomId, userId, practiceMode]);

  // Handle round updates
  const handleRoundUpdate = useCallback(async (updatedGame) => {
    try {
      setIsProcessingUpdate(true);
      setGame(updatedGame);

      // Check if it's player's turn
      const currentRound = updatedGame.rounds.find(r => r.roundNumber === updatedGame.currentRound);
      if (currentRound) {
        const isPlayer1Turn = !currentRound.player1Card;
        const isPlayer2Turn = !currentRound.player2Card;
        setIsPlayerTurn((isPlayer1 && isPlayer1Turn) || (!isPlayer1 && isPlayer2Turn));
      }

      // Check if game is over
      if (updatedGame.status === 'finished') {
        onGameEnd(updatedGame);
      }
    } finally {
      setIsProcessingUpdate(false);
    }
  }, [isPlayer1, onGameEnd]);

  // Socket event listeners
  useEffect(() => {
    if (!roomId || !userId) return; // Ensure roomId and userId are available

    // Listen for the game_state_updated event
    socket.on('game_state_updated', (updatedGame) => {
      console.log('Received game_state_updated:', updatedGame);
      setGame(updatedGame);
      // You might want to add more logic here based on the updated game state,
      // e.g., check if it's the player's turn, update displayed cards, etc.
    });

    // Existing listeners
    socket.on('gameCreated', (game) => {
      if (!gameId) {
        setGameId(game._id);
        setIsPlayer1(game.players[0].userId === userId);
      }
    });

    socket.on('roundUpdated', handleRoundUpdate);

    return () => {
      // Clean up listeners
      socket.off('game_state_updated');
      socket.off('gameCreated');
      socket.off('roundUpdated');
    };
  }, [roomId, userId, gameId, handleRoundUpdate]); // Include gameId in dependencies

  // Draw card
  const drawCard = async (card) => {
    if (!isPlayerTurn || isProcessingUpdate) return;

    try {
      setIsProcessingUpdate(true);
      setSelectedCard(card);

      // Remove card from available cards
      setAvailableCards(prev => prev.filter(c => c !== card));

      // Update game state
      await axios.put(`http://localhost:5000/api/carddraw/round/${gameId}`, {
        roundNumber: game.currentRound,
        playerCard: card,
        playerId: userId
      });
    } catch (error) {
      console.error('Error drawing card:', error);
    } finally {
      setIsProcessingUpdate(false);
    }
  };

  // Render card
  const Card = ({ value, onClick, disabled }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-20 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
        ${value === 'A' || value === 'K' || value === 'Q' || value === 'J' ? 'text-red-600' : 'text-black'}`}
    >
      {value}
    </motion.button>
  );

  // Render round result
  const RoundResult = ({ round }) => {
    if (!round.player1Card || !round.player2Card) return null;

    const getWinnerText = () => {
      if (!round.winner) return "It's a tie!";
      return round.winner === game.players[0].userId ? "Player 1 wins!" : "Player 2 wins!";
    };

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-4">
          <Card value={round.player1Card} disabled />
          <Card value={round.player2Card} disabled />
        </div>
        <p className="text-lg font-semibold">{getWinnerText()}</p>
      </div>
    );
  };

  // Practice mode: local game logic
  if (practiceMode) {
    // ... implement a simple local card draw war for one user ...
    // For brevity, show a simple UI for drawing cards for both players
    // and tracking score locally
    const [player1Card, setPlayer1Card] = useState(null);
    const [player2Card, setPlayer2Card] = useState(null);
    const [round, setRound] = useState(1);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const [status, setStatus] = useState('ongoing');
    const [message, setMessage] = useState('');

    const drawForBoth = () => {
      if (availableCards.length < 2 || round > 3) return;
      // Draw random cards for both players
      const idx1 = Math.floor(Math.random() * availableCards.length);
      const card1 = availableCards[idx1];
      const remaining = availableCards.filter((_, i) => i !== idx1);
      const idx2 = Math.floor(Math.random() * remaining.length);
      const card2 = remaining[idx2];
      setPlayer1Card(card1);
      setPlayer2Card(card2);
      setAvailableCards(remaining.filter((_, i) => i !== idx2));
      // Determine winner
      const cardValues = {
        'A': 14, 'K': 13, 'Q': 12, 'J': 11,
        '10': 10, '9': 9, '8': 8, '7': 7,
        '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
      };
      const v1 = cardValues[card1];
      const v2 = cardValues[card2];
      if (v1 > v2) {
        setPlayer1Score(s => s + 1);
        setMessage('Player 1 wins the round!');
      } else if (v2 > v1) {
        setPlayer2Score(s => s + 1);
        setMessage('Player 2 wins the round!');
      } else {
        setMessage("It's a tie!");
      }
      setTimeout(() => {
        setPlayer1Card(null);
        setPlayer2Card(null);
        setRound(r => r + 1);
        setMessage('');
        if (round === 3) {
          setStatus('finished');
        }
      }, 1500);
    };

    if (status === 'finished') {
      return (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold">Practice Over</h2>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="font-semibold">Player 1</p>
              <p className="text-2xl">{player1Score}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Player 2</p>
              <p className="text-2xl">{player2Score}</p>
            </div>
          </div>
          <div className="text-lg font-semibold">
            {player1Score > player2Score ? 'Player 1 wins!' : player2Score > player1Score ? 'Player 2 wins!' : "It's a tie!"}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-xl font-bold">Practice Mode - Round {round}</div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="font-semibold">Player 1</p>
            <p className="text-2xl">{player1Score}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">Player 2</p>
            <p className="text-2xl">{player2Score}</p>
          </div>
        </div>
        <button
          className="px-8 py-3 bg-green-500 rounded-lg text-white font-semibold text-lg hover:bg-green-600 transition"
          onClick={drawForBoth}
          disabled={status === 'finished' || availableCards.length < 2}
        >
          Draw Cards
        </button>
        {player1Card && player2Card && (
          <div className="flex gap-8 mt-4">
            <div className="w-20 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold text-black">
              {player1Card}
            </div>
            <div className="w-20 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold text-black">
              {player2Card}
            </div>
          </div>
        )}
        {message && <div className="text-lg font-semibold mt-2">{message}</div>}
      </div>
    );
  }

  if (!game) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Display game information */}
      <h2 className="text-2xl font-bold mb-4">Card Draw War</h2>
      {game && (
        <div className="flex justify-around w-full text-xl mb-4">
          <span>Player 1 Score: {game.players[0]?.score || 0}</span>
          <span>Player 2 Score: {game.players[1]?.score || 0}</span>
        </div>
      )}

      {/* Display current round information */}
      {game?.currentRound && game.status !== 'finished' && (
        <h3 className="text-xl mb-4">Round {game.currentRound}</h3>
      )}

      {/* Display waiting message or game board */}
      {!game || game.status === 'waiting' ? (
        <p className="text-xl">Waiting for opponent...</p>
      ) : game.status === 'ongoing' ? (
        <div className="flex flex-col items-center gap-4">
          {/* Display message for current turn or round result */}
          {!selectedCard && isPlayerTurn && (
            <p className="text-lg font-semibold">Your turn to draw a card!</p>
          )}
          {selectedCard && (
            <p className="text-lg font-semibold">You drew: {selectedCard}</p>
          )}

          {/* Display available cards */}
          <div className="grid grid-cols-7 gap-2">
            {availableCards.map((card) => (
              <Card
                key={card}
                value={card}
                onClick={() => drawCard(card)}
                disabled={!isPlayerTurn || isProcessingUpdate || selectedCard !== null}
              />
            ))}
          </div>

          {/* Display round results if available for the previous round */}
          {game.rounds.length >= game.currentRound && game.rounds[game.currentRound - 1]?.status === 'completed' && (
             <RoundResult round={game.rounds[game.currentRound - 1]} />
          )}


        </div>
      ) : game.status === 'finished' ? (
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
          {game.winner ? (
            <p className="text-xl">Winner: {game.winner === userId ? "You" : "Opponent"}</p>
          ) : (
            <p className="text-xl">It's a tie!</p>
          )}
          {/* Optionally display final scores */}
           <div className="flex justify-around w-full text-xl mb-4 mt-2">
              <span>Player 1 Final Score: {game.players[0]?.score || 0}</span>
              <span>Player 2 Final Score: {game.players[1]?.score || 0}</span>
            </div>
          {onGameEnd && <button onClick={() => onGameEnd(game)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">View Results</button>}
        </div>
      ) : (
        // Handle other potential game statuses or initial loading
        <p className="text-xl">Loading game...</p>
      )}

    </div>
  );
};

export default CardDrawGameLogic; 