import React, { useState, useEffect, useCallback } from 'react';
import { generateQuestions } from './services/geminiService';
import { Question, GameState, Lifelines, LifelineType, AnswerState, AudienceVote, LanguageCode, DifficultyLevel } from './types';
import AnswerOption from './components/AnswerOption';
import LifelineBar from './components/LifelineBar';
import PrizeLadder from './components/PrizeLadder';
import AudiencePoll from './components/AudiencePoll';
import PhoneFriend from './components/PhoneFriend';
import LanguageSelector from './components/LanguageSelector';
import DifficultySelector from './components/DifficultySelector';
import { translations } from './utils/translations';
import TextToSpeechControls from './components/TextToSpeechControls';

const TOTAL_QUESTIONS = 15;
const SEEN_SENTENCES_KEY = 'germanMillionaireSeenSentences';
const MAX_SEEN_SENTENCES = 100;

// --- Persistence Helpers ---
const getSeenSentences = (): string[] => {
    try {
        const stored = localStorage.getItem(SEEN_SENTENCES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to read seen sentences from localStorage", error);
        return [];
    }
};

const addSeenSentence = (sentence: string) => {
    try {
        let seen = getSeenSentences();
        if (seen.includes(sentence)) return;

        seen.push(sentence);
        if (seen.length > MAX_SEEN_SENTENCES) {
            seen = seen.slice(seen.length - MAX_SEEN_SENTENCES);
        }
        localStorage.setItem(SEEN_SENTENCES_KEY, JSON.stringify(seen));
    } catch (error) {
        console.error("Failed to save seen sentence to localStorage", error);
    }
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('START');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [lifelines, setLifelines] = useState<Lifelines>({ fiftyFifty: true, askAudience: true, phoneFriend: true, switchQuestion: true });
    const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answerState, setAnswerState] = useState<AnswerState>('default');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<LanguageCode>('en');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('B1');
    const [t, setT] = useState(translations.en);

    const [showAudiencePoll, setShowAudiencePoll] = useState(false);
    const [audienceVote, setAudienceVote] = useState<AudienceVote | null>(null);
    const [showPhoneFriend, setShowPhoneFriend] = useState(false);
    const [friendAnswer, setFriendAnswer] = useState<string | null>(null);

     useEffect(() => {
        setT(translations[language]);
    }, [language]);
    
    useEffect(() => {
        if (gameState === 'PLAYING' && questions.length > 0 && questions[currentQuestionIndex]) {
            addSeenSentence(questions[currentQuestionIndex].promptSentence);
        }
    }, [gameState, currentQuestionIndex, questions]);


    const resetGame = useCallback(() => {
        setGameState('START');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setLifelines({ fiftyFifty: true, askAudience: true, phoneFriend: true, switchQuestion: true });
        setHiddenAnswers([]);
        setSelectedAnswer(null);
        setAnswerState('default');
        setIsProcessing(false);
        setError(null);
        setShowAudiencePoll(false);
        setAudienceVote(null);
        setShowPhoneFriend(false);
        setFriendAnswer(null);
    }, []);

    const startGame = useCallback(async () => {
        setGameState('LOADING');
        setError(null);
        try {
            const seenSentences = getSeenSentences();
            const initialQuestions = await generateQuestions(3, seenSentences, t.languageName, difficulty);

            if (initialQuestions.length < 3) {
                 throw new Error("Could not generate enough unique questions. Please try again later.");
            }

            setQuestions(initialQuestions);
            setGameState('PLAYING');

            const newlyFetchedSentences = initialQuestions.map(q => q.promptSentence);
            const allSentencesToAvoid = [...seenSentences, ...newlyFetchedSentences];

            generateQuestions(TOTAL_QUESTIONS - 3 + 1, allSentencesToAvoid, t.languageName, difficulty)
                .then(remainingQuestions => {
                    const existingSentences = new Set(initialQuestions.map(q => q.promptSentence));
                    const uniqueRemaining = remainingQuestions.filter(q => !existingSentences.has(q.promptSentence));
                    setQuestions(prev => [...prev, ...uniqueRemaining]);
                })
                .catch(err => {
                    console.error("Failed to fetch remaining questions in background:", err);
                });

        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
            setGameState('START');
        }
    }, [t.languageName, difficulty]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setAnswerState('default');
            setHiddenAnswers([]);
            setIsProcessing(false);
        } else {
            setGameState('GAME_OVER_WIN');
        }
    }, [currentQuestionIndex]);

    const handleAnswerSelect = (answer: string) => {
        if (isProcessing) return;

        setIsProcessing(true);
        setSelectedAnswer(answer);
        setAnswerState('selected');

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = answer === currentQuestion.correctAnswer;

        setTimeout(() => {
            if (isCorrect) {
                setAnswerState('correct');
                setTimeout(handleNextQuestion, 3000);
            } else {
                setAnswerState('incorrect');
                setTimeout(() => setGameState('GAME_OVER_LOSE'), 5000);
            }
        }, 3000);
    };

    const useLifeline = (type: LifelineType) => {
        if (!lifelines[type] || isProcessing) return;

        const currentQuestion = questions[currentQuestionIndex];
        
        setLifelines(prev => ({ ...prev, [type]: false }));

        switch (type) {
            case 'fiftyFifty':
                const incorrectOptions = currentQuestion.options.filter(opt => opt !== currentQuestion.correctAnswer);
                const shuffledIncorrect = incorrectOptions.sort(() => 0.5 - Math.random());
                setHiddenAnswers(shuffledIncorrect.slice(0, 2));
                break;
            case 'askAudience':
                setShowAudiencePoll(true);
                setTimeout(() => {
                    const vote: AudienceVote = {};
                    let options = currentQuestion.options.filter(opt => !hiddenAnswers.includes(opt));
                    const isCorrectHighlyProbable = Math.random() < 0.95;
                    
                    if(isCorrectHighlyProbable) {
                        options.forEach(opt => {
                            if (opt === currentQuestion.correctAnswer) {
                                vote[opt] = Math.floor(Math.random() * 30) + 50; // 50-79%
                            } else {
                                vote[opt] = Math.floor(Math.random() * 15) + 5; // 5-19%
                            }
                        });
                    } else {
                         options.forEach(opt => vote[opt] = Math.floor(Math.random() * 100));
                    }
                    
                    let total = Object.values(vote).reduce((sum, v) => sum + v, 0);
                    for (const key in vote) {
                        vote[key] = Math.round((vote[key] / total) * 100);
                    }
                    
                    setAudienceVote(vote);
                }, 8000);
                break;
            case 'phoneFriend':
                setShowPhoneFriend(true);
                setTimeout(() => {
                    const isCorrect = Math.random() < 0.95;
                    if(isCorrect) {
                        setFriendAnswer(currentQuestion.correctAnswer);
                    } else {
                        const availableOptions = currentQuestion.options.filter(opt => !hiddenAnswers.includes(opt) && opt !== currentQuestion.correctAnswer);
                        setFriendAnswer(availableOptions[Math.floor(Math.random() * availableOptions.length)]);
                    }
                }, 8000);
                break;
            case 'switchQuestion':
                if (questions.length > TOTAL_QUESTIONS) {
                    const newQuestions = [...questions];
                    const switchedQuestion = newQuestions.splice(currentQuestionIndex, 1)[0];
                    newQuestions.push(switchedQuestion);
                    setQuestions(newQuestions);
                    setHiddenAnswers([]);
                }
                break;
        }
    };
    
    const currentQuestion = questions[currentQuestionIndex];

    const renderContent = () => {
        switch (gameState) {
            case 'START':
                return (
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-yellow-400 mb-4 tracking-wider">{t.title}</h1>
                        <p className="text-xl text-slate-300 mb-8">{t.subtitle}</p>
                        <DifficultySelector selectedDifficulty={difficulty} onSelectDifficulty={setDifficulty} t={t} />
                        <LanguageSelector selectedLanguage={language} onSelectLanguage={setLanguage} t={t} />
                        <button onClick={startGame} className="bg-yellow-400 text-slate-900 font-bold py-4 px-10 rounded-full text-2xl hover:bg-yellow-500 transition-all duration-300 shadow-lg mt-8">
                            {t.startGame}
                        </button>
                        {error && <p className="text-red-400 mt-4">{error}</p>}
                    </div>
                );
            case 'LOADING':
                return <div className="text-2xl text-yellow-400 animate-pulse">{t.generatingQuestions}</div>;
            case 'GAME_OVER_WIN':
            case 'GAME_OVER_LOSE':
                 return (
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-yellow-400 mb-4">{gameState === 'GAME_OVER_WIN' ? t.congratulations : t.gameOver}</h1>
                        <p className="text-2xl text-slate-200 mb-8">
                            {gameState === 'GAME_OVER_WIN' ? t.winMessage : t.loseMessage(currentQuestionIndex)}
                        </p>
                         {gameState === 'GAME_OVER_LOSE' && currentQuestion && (
                             <p className="text-lg text-slate-400 mb-8">{t.correctAnswerWas} <span className="font-bold text-green-400 font-inter">{currentQuestion.correctAnswer}</span></p>
                         )}
                        <button onClick={resetGame} className="bg-yellow-400 text-slate-900 font-bold py-3 px-8 rounded-full text-xl hover:bg-yellow-500 transition-all duration-300 shadow-lg">
                            {t.playAgain}
                        </button>
                    </div>
                );
            case 'PLAYING':
                if (!currentQuestion) {
                    return <div className="text-2xl text-yellow-400 animate-pulse">{t.loadingNextQuestion}</div>;
                }
                return (
                    <div className="w-full h-full flex flex-col">
                        <LifelineBar lifelines={lifelines} useLifeline={useLifeline} currentQuestionIndex={currentQuestionIndex} />
                        <div className="flex-grow flex flex-col justify-end items-center p-4 md:p-8">
                           <div className="w-full flex items-center bg-slate-900/50 border-2 border-slate-700 rounded-lg p-4 md:p-6 mb-8 shadow-lg">
                               <div className="mr-4">
                                   <TextToSpeechControls key={`${currentQuestion.id}-prompt`} text={currentQuestion.promptSentence} />
                               </div>
                               <p className={`flex-1 text-xl md:text-3xl text-slate-100 font-semibold text-center ${t.font}`}>{currentQuestion.promptSentence}</p>
                           </div>
                           <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, index) => (
                                    <AnswerOption
                                        key={index}
                                        index={index}
                                        option={option}
                                        onClick={handleAnswerSelect}
                                        isDisabled={isProcessing || hiddenAnswers.includes(option)}
                                        isHidden={hiddenAnswers.includes(option)}
                                        answerState={selectedAnswer === option ? answerState : 'default'}
                                        isCorrect={answerState === 'incorrect' && option === currentQuestion.correctAnswer}
                                    />
                                ))}
                           </div>
                        </div>
                    </div>
                );
        }
    };


    return (
        <main className={`bg-gradient-to-b from-slate-900 to-indigo-900 min-h-screen text-white flex flex-col items-center justify-center p-2 md:p-4 relative ${t.font}`} dir={t.dir}>
             {gameState === 'PLAYING' && <PrizeLadder currentLevel={currentQuestionIndex} />}
             <div className="w-full max-w-4xl mx-auto flex items-center justify-center flex-grow">
                 {renderContent()}
             </div>
             {showAudiencePoll && (
                <AudiencePoll
                    vote={audienceVote}
                    onClose={() => setShowAudiencePoll(false)}
                    t={t}
                />
            )}
            {showPhoneFriend && (
                <PhoneFriend
                    answer={friendAnswer}
                    onClose={() => setShowPhoneFriend(false)}
                    t={t}
                />
            )}
        </main>
    );
};

export default App;