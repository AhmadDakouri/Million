import React from 'react';
import { CloseIcon, PhoneIcon } from './icons';
import { Translations } from '../types';

interface PhoneFriendProps {
    answer: string | null;
    onClose: () => void;
    t: Translations;
}

const PhoneFriend: React.FC<PhoneFriendProps> = ({ answer, onClose, t }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className={`bg-slate-800 border-2 border-slate-600 rounded-2xl p-8 w-full max-w-md shadow-2xl relative text-center ${t.font}`} dir={t.dir}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <CloseIcon className="w-8 h-8" />
                </button>
                <h2 className="text-3xl font-bold text-yellow-400 mb-6">{t.phoneAFriend}</h2>
                
                {answer ? (
                    <div>
                        <p className="text-xl text-slate-300 mb-4">"{t.friendAnswer}"</p>
                        <div className="bg-slate-900 border border-slate-600 p-4 rounded-lg">
                            <p className={`text-2xl font-bold ${t.font} text-yellow-300`}>{answer}</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-xl text-slate-300 mb-6 animate-pulse">{t.friendThinking}</p>
                        <div className="flex justify-center">
                            <PhoneIcon className="w-16 h-16 text-yellow-400 animate-pulse" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneFriend;