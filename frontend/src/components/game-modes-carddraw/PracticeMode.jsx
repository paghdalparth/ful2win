import React from 'react';
import { ChevronLeft } from 'lucide-react';
import CardDrawGameLogic from '../../games/CardDraw/CardDrawGameLogic';

const PracticeMode = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 text-white flex flex-col">
      <header className="flex items-center gap-2 p-4 border-b border-green-800">
        <button onClick={onBack} className="flex items-center text-white hover:text-green-300 transition-colors">
          <ChevronLeft size={24} />
          <span className="ml-2">Back</span>
        </button>
        <h1 className="text-xl font-bold ml-4">Card Draw War - Practice Mode</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center">
        <CardDrawGameLogic practiceMode={true} />
      </div>
    </div>
  );
};

export default PracticeMode;
