import React from 'react';
import { AnswerState } from '../types';
import TextToSpeechControls from './TextToSpeechControls';

interface AnswerOptionProps {
    option: string;
    index: number;
    onClick: (option: string) => void;
    isDisabled: boolean;
    isHidden: boolean;
    answerState: AnswerState;
    isCorrect: boolean;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({ option, index, onClick, isDisabled, isHidden, answerState, isCorrect }) => {
    
    const baseClasses = `w-full text-lg font-inter font-bold p-4 rounded-lg border-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center justify-between gap-4`;
    
    const stateClasses = {
        default: "bg-slate-800/80 border-slate-600 hover:bg-slate-700/80 text-white",
        selected: "bg-orange-500 border-orange-400 text-white animate-pulse",
        correct: "bg-green-600 border-green-500 text-white",
        incorrect: "bg-red-600 border-red-500 text-white",
    };

    let appliedClasses = stateClasses.default;
    if (answerState !== 'default') {
        appliedClasses = stateClasses[answerState];
    } else if (isCorrect) {
        appliedClasses = stateClasses.correct;
    }
    
    const numberCircle = (
        <span className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-900/50 border border-slate-600 flex items-center justify-center text-yellow-400 font-inter font-bold">
            {['A', 'B', 'C', 'D'][index]}
        </span>
    );

    if (isHidden) {
        return (
            <div className={`w-full h-[72px] rounded-lg border-2 bg-slate-900 border-slate-800 opacity-50`}></div>
        );
    }

    return (
        <button
            onClick={() => onClick(option)}
            disabled={isDisabled}
            className={`${baseClasses} ${appliedClasses} ${isDisabled && !isHidden ? 'cursor-not-allowed opacity-70' : ''}`}
        >
            <div className="flex items-center gap-4 text-left flex-1">
                {numberCircle}
                <span className="flex-1">{option}</span>
            </div>
            <TextToSpeechControls text={option} />
        </button>
    );
};

export default AnswerOption;