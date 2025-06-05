import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Users, Clock, Trophy } from 'lucide-react';

const TournamentMode = ({ onBack, gameId }) => {
  const navigate = useNavigate();

  const handleStartGame = (price) => {
    navigate(`/games/${gameId}/play/tournament?price=${price}`);
  };

  return (
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
                <span className="text-white/70">5 Matches</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                <span className="text-yellow-400">Tournament Mode</span>
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
              <h1 className="text-4xl font-bold mb-4">Tournament Mode</h1>
              <p className="text-white/70 text-lg">
                Compete in a series of 5 matches. The player with the most wins takes the grand prize!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartGame(25)}
                className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-xl hover:brightness-110 transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">Entry Fee: ₹25</h3>
                <p className="text-white/80 mb-4">Prize Pool: ₹40</p>
                <div className="text-sm text-white/60">
                  <p>• 5 matches</p>
                  <p>• Standard deck</p>
                  <p>• Best of 3 each match</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartGame(50)}
                className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-xl hover:brightness-110 transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">Entry Fee: ₹50</h3>
                <p className="text-white/80 mb-4">Prize Pool: ₹80</p>
                <div className="text-sm text-white/60">
                  <p>• 5 matches</p>
                  <p>• Standard deck</p>
                  <p>• Best of 3 each match</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartGame(100)}
                className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl hover:brightness-110 transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">Entry Fee: ₹100</h3>
                <p className="text-white/80 mb-4">Prize Pool: ₹160</p>
                <div className="text-sm text-white/60">
                  <p>• 5 matches</p>
                  <p>• Standard deck</p>
                  <p>• Best of 3 each match</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TournamentMode; 