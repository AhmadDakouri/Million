
import React from 'react';

const prizeLevels = [
  "100", "200", "300", "500", "1,000",
  "2,000", "4,000", "8,000", "16,000", "32,000",
  "64,000", "125,000", "250,000", "500,000", "1,000,000"
].reverse();

interface PrizeLadderProps {
    currentLevel: number; // 0-14
}

const PrizeLadder: React.FC<PrizeLadderProps> = ({ currentLevel }) => {
    const activePrizeIndex = prizeLevels.length - 1 - currentLevel;
    
    return (
        <div className="absolute top-1/2 -translate-y-1/2 left-4 hidden lg:block bg-slate-900/50 p-4 rounded-lg border-2 border-slate-700 shadow-lg">
            <ul className="flex flex-col-reverse text-right">
                {prizeLevels.map((prize, index) => {
                    const isCurrent = index === activePrizeIndex;
                    const isSafeHaven = index === 4 || index === 9 || index === 14;
                    const isAchieved = index > activePrizeIndex;

                    return (
                        <li key={prize} className={`
                            py-1 px-4 text-lg font-bold transition-all duration-300
                            ${isCurrent ? 'bg-yellow-500 text-slate-900 rounded' : ''}
                            ${isSafeHaven ? 'text-white' : 'text-slate-400'}
                             ${isAchieved ? 'text-yellow-400 opacity-60' : ''}
                        `}>
                           <span className="mr-4 text-slate-500">{prizeLevels.length - index}</span> 
                           {prize}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PrizeLadder;
