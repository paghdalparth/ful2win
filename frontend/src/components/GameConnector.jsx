import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import GameResultLobby from './GameResultLobby';
import EnhancedGameLobby from './EnhancedGameLobby';

// Import game components
import TictactoeGameLogic from '../games/Tictactoe/TictactoeGameLogic';
import StoneGameLogic from '../games/Stone-Paper/StoneGameLogic';
import CoinflipGameLogic from '../games/Coinflip/CoinflipGameLogic';
import DiceGameLogic from '../games/Dice/DiceGameLogic';
import MemoryMatchGameLogic from '../games/Memory/MemoryMatchGameLogic';
import CardDrawGameLogic from '../games/CardDraw/CardDrawGameLogic';

// Game mode layouts
import TictactoeLayout from './game-modes-tictactoe/GameModeLayout';
import StonePaperLayout from './game-modes-stonepaper/GameModeLayout';
import CoinflipLayout from './game-modes-coinflip/GameModeLayout';
import DiceLayout from './game-modes-dice/GameModeLayout';
import MemoryMatchLayout from './game-modes-memorymatch/MemoryMatchLayout';

/**
 * GameConnector - Handles the connection to different games and manages game flow
 * This component loads the appropriate game based on URL parameters and handles game completion
 */
const GameConnector = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { walletBalance, updateWalletBalance } = useWallet();
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [price, setPrice] = useState(10);

  useEffect(() => {
    const priceParam = searchParams.get('price');
    if (priceParam) {
      setPrice(parseInt(priceParam));
    }
  }, [searchParams]);

  const handleGameEnd = (result) => {
    setGameResult(result);
    setShowResult(true);
  };

  const handleExit = () => {
    navigate('/');
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setGameResult(null);
  };

  const getFormattedModeType = () => {
    const modeType = searchParams.get('mode') || 'classic';
    return modeType.charAt(0).toUpperCase() + modeType.slice(1);
  };

  if (showResult) {
    return (
      <GameResultLobby
        gameId={gameId}
        result={gameResult}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
        entryFee={price}
      />
    );
  }

  return (
    <EnhancedGameLobby 
      gameId={gameId}
      gameImg={gameId}
      gameMode={getFormattedModeType()}
      entryFee={price}
      onExit={handleExit}
      initialStatus="waiting"
    />
  );
};

export default GameConnector; 