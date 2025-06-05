import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Users, Clock, Gamepad2 } from 'lucide-react';
import ClassicMode from './ClassicMode';
import TournamentMode from './TournamentMode';
import PracticeMode from './PracticeMode';

const GameModeLayout = ({ onBack, gameId }) => {
  const navigate = useNavigate();

  const handleModeSelect = (mode) => {
    navigate(`/games/${gameId}/${mode}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-md border-b border-white/10">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                    <span>Back to Games</span>
                  </button>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-white/50" />
                      <span className="text-white/70">2 Players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={20} className="text-white/50" />
                      <span className="text-white/70">Best of 3</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gamepad2 size={20} className="text-white/50" />
                      <span className="text-white/70">Card Draw War</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 pb-8">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Select Game Mode</h1>
                    <p className="text-white/70 text-lg">
                      Choose your preferred way to play Card Draw War
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleModeSelect('classic')}
                      className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-xl hover:brightness-110 transition-all"
                    >
                      <h3 className="text-2xl font-semibold mb-4">Classic Mode</h3>
                      <p className="text-white/80 mb-6">
                        Play a single match with best of 3 rounds. Perfect for quick games!
                      </p>
                      <div className="text-sm text-white/60">
                        <p>• Single match</p>
                        <p>• Best of 3 rounds</p>
                        <p>• Multiple entry fees</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleModeSelect('tournament')}
                      className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-xl hover:brightness-110 transition-all"
                    >
                      <h3 className="text-2xl font-semibold mb-4">Tournament Mode</h3>
                      <p className="text-white/80 mb-6">
                        Compete in a series of 5 matches. The player with the most wins takes the grand prize!
                      </p>
                      <div className="text-sm text-white/60">
                        <p>• 5 matches</p>
                        <p>• Best of 3 each match</p>
                        <p>• Higher prize pools</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleModeSelect('practice')}
                      className="bg-gradient-to-br from-green-600 to-green-400 p-8 rounded-xl hover:brightness-110 transition-all"
                    >
                      <h3 className="text-2xl font-semibold mb-4">Practice Mode</h3>
                      <p className="text-white/80 mb-6">
                        Play against yourself to practice and learn the game mechanics.
                      </p>
                      <div className="text-sm text-white/60">
                        <p>• Single player</p>
                        <p>• No entry fee</p>
                        <p>• No rewards</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </main>
          </div>
        }
      />
      <Route path="/classic" element={<ClassicMode onBack={() => navigate(`/games/${gameId}`)} gameId={gameId} />} />
      <Route path="/tournament" element={<TournamentMode onBack={() => navigate(`/games/${gameId}`)} gameId={gameId} />} />
      <Route path="/practice" element={<PracticeMode onBack={() => navigate(`/games/${gameId}`)} gameId={gameId} />} />
    </Routes>
  );
};

export default GameModeLayout; 