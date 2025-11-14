import React from 'react';
import { AudienceVote, Translations } from '../types';
import { CloseIcon } from './icons';

interface AudiencePollProps {
    vote: AudienceVote | null;
    onClose: () => void;
    t: Translations;
}

const AudiencePoll: React.FC<AudiencePollProps> = ({ vote, onClose, t }) => {
    const Bar: React.FC<{ percentage: number }> = ({ percentage }) => (
        <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
                className="bg-yellow-400 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className={`bg-slate-800 border-2 border-slate-600 rounded-2xl p-8 w-full max-w-md shadow-2xl relative ${t.font}`} dir={t.dir}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <CloseIcon className="w-8 h-8" />
                </button>
                <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">{t.audiencePoll}</h2>
                
                {vote ? (
                    <div className="space-y-4 text-white">
                        {/* FIX: Cast the result of Object.entries to [string, number][] to ensure correct type inference for sort and map operations. */}
                        {(Object.entries(vote) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([option, percentage]) => (
                            <div key={option}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className={`${t.font} text-lg ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>{option}</p>
                                    <p className="font-bold text-xl">{percentage}%</p>
                                </div>
                                <Bar percentage={percentage} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-xl text-slate-300 mb-4 animate-pulse">{t.pollingAudience}</p>
                         <div className="flex justify-center items-end space-x-2 h-24">
                            <div className="w-4 bg-yellow-400 animate-pulse" style={{ animationDelay: '0s', height: '40%' }}></div>
                            <div className="w-4 bg-yellow-400 animate-pulse" style={{ animationDelay: '0.1s', height: '80%' }}></div>
                            <div className="w-4 bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s', height: '60%' }}></div>
                            <div className="w-4 bg-yellow-400 animate-pulse" style={{ animationDelay: '0.3s', height: '90%' }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudiencePoll;