import React from 'react';
import { Lifelines, LifelineType } from '../types';
import { AudienceIcon, PhoneIcon, SwitchIcon } from './icons';

interface LifelineButtonProps {
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    ariaLabel: string;
}

const FiftyFiftyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M496 400H288V272h208c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H288V0h-64v128H16c-17.67 0-32 14.33-32 32v208c0 17.67 14.33 32 32 32h208v112h64V400h208c17.67 0 32-14.33 32-32V272c0-17.67-14.33-32-32-32h-208v128zM120 232c-22.09 0-40-17.91-40-40s17.91-40 40-40 40 17.91 40 40-17.91 40-40 40zm0-112c-22.09 0-40 17.91-40 40s17.91 40 40 40 40-17.91 40-40-17.91-40-40-40zm272 256c-22.09 0-40-17.91-40-40s17.91-40 40-40 40 17.91 40 40-17.91 40-40 40zm0-112c-22.09 0-40 17.91-40 40s17.91 40 40 40 40-17.91 40-40-17.91-40-40-40z"></path></svg>
);


const LifelineButton: React.FC<LifelineButtonProps> = ({ onClick, disabled, children, ariaLabel }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`relative w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full transition-all duration-300
        ${disabled
            ? 'bg-slate-700 cursor-not-allowed'
            : 'bg-yellow-400 hover:bg-yellow-500 shadow-lg transform hover:scale-110'
        }`}
    >
        <div className={`
            ${disabled ? 'text-slate-500' : 'text-slate-900'}
        `}>
            {children}
        </div>
        {disabled && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>}
    </button>
);


interface LifelineBarProps {
    lifelines: Lifelines;
    useLifeline: (type: LifelineType) => void;
    currentQuestionIndex: number;
}

const LifelineBar: React.FC<LifelineBarProps> = ({ lifelines, useLifeline, currentQuestionIndex }) => {
    return (
        <div className="w-full flex justify-center gap-2 mb-4 pt-4 md:pt-0 md:w-auto md:mb-0 md:flex-col md:gap-4 md:absolute md:top-8 md:right-8 z-20">
            <LifelineButton onClick={() => useLifeline('fiftyFifty')} disabled={!lifelines.fiftyFifty} ariaLabel="Fifty-fifty">
                <FiftyFiftyIcon className="w-7 h-7 md:w-10 md:h-10"/>
            </LifelineButton>
            <LifelineButton onClick={() => useLifeline('askAudience')} disabled={!lifelines.askAudience} ariaLabel="Ask the audience">
                <AudienceIcon className="w-7 h-7 md:w-10 md:h-10"/>
            </LifelineButton>
            <LifelineButton onClick={() => useLifeline('phoneFriend')} disabled={!lifelines.phoneFriend} ariaLabel="Phone a friend">
                <PhoneIcon className="w-7 h-7 md:w-10 md:h-10"/>
            </LifelineButton>
            <LifelineButton onClick={() => useLifeline('switchQuestion')} disabled={!lifelines.switchQuestion || currentQuestionIndex < 7} ariaLabel="Switch the question">
                <SwitchIcon className="w-7 h-7 md:w-10 md:h-10"/>
            </LifelineButton>
        </div>
    );
};

export default LifelineBar;