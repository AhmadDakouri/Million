import React from 'react';
import { languages, LanguageCode } from '../utils/translations';
import { Translations } from '../types';

interface LanguageSelectorProps {
    selectedLanguage: LanguageCode;
    onSelectLanguage: (language: LanguageCode) => void;
    t: Translations;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onSelectLanguage, t }) => {
    return (
        <div className="my-6">
            <h3 className="text-lg font-semibold text-slate-300 mb-4">{t.selectLanguage}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 max-w-sm mx-auto">
                {Object.entries(languages).map(([code, { flag }]) => (
                    <button
                        key={code}
                        onClick={() => onSelectLanguage(code as LanguageCode)}
                        className={`text-4xl rounded-lg p-2 transition-all duration-200 transform hover:scale-125
                            ${selectedLanguage === code ? 'bg-yellow-400/30 ring-2 ring-yellow-400 scale-110' : ''}
                        `}
                        aria-label={`Select ${languages[code as LanguageCode].name}`}
                    >
                        {flag}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSelector;
