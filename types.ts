import { LanguageCode } from './utils/translations';

export interface Question {
  id: string;
  promptSentence: string;
  options: string[];
  correctAnswer: string;
}

export type GameState = 'START' | 'LOADING' | 'PLAYING' | 'GAME_OVER_WIN' | 'GAME_OVER_LOSE';

export interface Lifelines {
  fiftyFifty: boolean;
  askAudience: boolean;
  phoneFriend: boolean;
  switchQuestion: boolean;
}

export type LifelineType = keyof Lifelines;

export type AnswerState = 'default' | 'selected' | 'correct' | 'incorrect';

export interface AudienceVote {
  [option: string]: number;
}

export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface Translations {
    languageName: string;
    dir: 'ltr' | 'rtl';
    font: 'font-inter' | 'font-cairo';
    title: string;
    subtitle: string;
    startGame: string;
    playAgain: string;
    generatingQuestions: string;
    loadingNextQuestion: string;
    congratulations: string;
    gameOver: string;
    winMessage: string;
    loseMessage: (questions: number) => string;
    correctAnswerWas: string;
    audiencePoll: string;
    pollingAudience: string;
    phoneAFriend: string;
    friendThinking: string;
    friendAnswer: string;
    selectLanguage: string;
    selectDifficulty: string;
    difficultyLevels: {
        A1: string;
        A2: string;
        B1: string;
        B2: string;
    };
}

export type { LanguageCode };