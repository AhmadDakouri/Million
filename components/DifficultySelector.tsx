import React from 'react';
import { DifficultyLevel, Translations } from '../types';

interface DifficultySelectorProps {
    selectedDifficulty: DifficultyLevel;
    onSelectDifficulty: (level: DifficultyLevel) => void;
    t: Translations;
}

const levels: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2'];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selectedDifficulty, onSelectDifficulty, t }) => {
    return (
        <div className="my-6">
            <h3 className="text-lg font-semibold text-slate-300 mb-4">{t.selectDifficulty}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-sm mx-auto">
                {levels.map((level) => (
                    <button
                        key={level}
                        onClick={() => onSelectDifficulty(level)}
                        className={`px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105
                            ${selectedDifficulty === level
                                ? 'bg-yellow-400 text-slate-900 font-bold ring-2 ring-yellow-500 shadow-lg'
                                : 'bg-slate-800 text-white font-medium hover:bg-slate-700'
                            }
                        `}
                        aria-label={`Select level ${level}`}
                    >
                        <span className="text-xl font-bold">{level}</span>
                        <span className="block text-sm">{t.difficultyLevels[level]}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DifficultySelector;
