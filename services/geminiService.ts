import { GoogleGenAI, Modality } from "@google/genai";
import { Question, DifficultyLevel } from '../types';
import { sendMessageToDeepSeek } from './api';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateQuestions = async (count: number, existingSentences: string[], targetLanguage: string, difficulty: DifficultyLevel): Promise<Question[]> => {
  const prompt = `Please generate ${count} unique quiz questions for learners of German at the ${difficulty} level. For each question, provide a sentence in ${targetLanguage}, its correct German translation, and three specific types of incorrect German translations:
1. Two incorrect translations that are very similar to the correct answer (e.g., with minor grammatical errors, different word order, or slightly wrong vocabulary).
2. One incorrect translation that is more distinctly different in meaning but still a plausible distractor.
Do not repeat any of the following ${targetLanguage} sentences: ${existingSentences.join(', ')}.
Your response must be a JSON array of objects. Each object should have the following structure:
{
  "targetLanguageSentence": "...",
  "correctGermanTranslation": "...",
  "incorrectGermanTranslations": ["...", "...", "..."]
}
The 'incorrectGermanTranslations' array must contain exactly three strings.
Do not include any explanatory text or markdown formatting outside of the JSON array itself.`;

  try {
    const responseText = await sendMessageToDeepSeek(prompt);
    
    // Extract JSON from potential markdown code block or surrounding text
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonBlockRegex);
    let jsonString = responseText;
    if (match && match[1]) {
        jsonString = match[1];
    } else {
        const firstBracket = jsonString.indexOf('[');
        const lastBracket = jsonString.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonString = jsonString.substring(firstBracket, lastBracket + 1);
        }
    }

    const jsonResponse = JSON.parse(jsonString.trim());

    if (!Array.isArray(jsonResponse)) {
      throw new Error("Invalid response format from API. Expected a JSON array.");
    }

    const questions: Question[] = jsonResponse.map((item: any, index: number) => {
      if (!item.targetLanguageSentence || !item.correctGermanTranslation || !Array.isArray(item.incorrectGermanTranslations) || item.incorrectGermanTranslations.length !== 3) {
        console.error(`Invalid question structure in API response for item at index ${index}:`, item);
        return null;
      }
      const options = shuffleArray([...item.incorrectGermanTranslations, item.correctGermanTranslation]);
      return {
        id: `${Date.now()}-${index}`,
        promptSentence: item.targetLanguageSentence,
        options,
        correctAnswer: item.correctGermanTranslation,
      };
    }).filter((q): q is Question => q !== null);

    if (questions.length < count && jsonResponse.length > 0) {
        console.warn(`API returned ${jsonResponse.length} items but only ${questions.length} were valid.`);
    }
    
    return questions;
  } catch (error) {
    console.error("Error generating questions with DeepSeek:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  // DeepSeek is now used for question generation, which requires a DeepSeek API key.
  // The Gemini TTS service requires a Google AI API key.
  // Since the app now expects a DeepSeek key in the environment, we are disabling TTS to avoid API errors.
  console.warn("Text-to-speech feature is disabled because the question generation now uses the DeepSeek API.");
  throw new Error("Text-to-speech is not available with the current API configuration.");
};
