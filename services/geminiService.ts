import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, DifficultyLevel } from '../types';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateQuestions = async (count: number, existingSentences: string[], targetLanguage: string, difficulty: DifficultyLevel): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Please generate ${count} unique quiz questions for learners of German at the ${difficulty} level. For each question, provide a sentence in ${targetLanguage}, its correct German translation, and three specific types of incorrect German translations:
1. Two incorrect translations that are very similar to the correct answer (e.g., with minor grammatical errors, different word order, or slightly wrong vocabulary).
2. One incorrect translation that is more distinctly different in meaning but still a plausible distractor.
Do not repeat any of the following ${targetLanguage} sentences: ${existingSentences.join(', ')}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert in German and ${targetLanguage} linguistics, specializing in creating educational quiz content. Your task is to generate questions for a German language quiz for learners at the ${difficulty} level. For each question, you must provide: a sentence in ${targetLanguage}, its correct German translation, and exactly three incorrect German translations. Among the three incorrect translations, two should be semantically close or have subtle grammatical errors compared to the correct answer, making them challenging distractors. The third incorrect translation should be more different in meaning, testing broader comprehension. Ensure the final output is a valid JSON array where the 'incorrectGermanTranslations' array always contains exactly three strings based on this logic.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              targetLanguageSentence: {
                type: Type.STRING,
                description: `A sentence in ${targetLanguage}.`
              },
              correctGermanTranslation: {
                type: Type.STRING,
                description: "The correct German translation of the sentence."
              },
              incorrectGermanTranslations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of three incorrect but plausible German translations, with two being very similar to the correct answer and one being distinctly different."
              }
            },
            required: ["targetLanguageSentence", "correctGermanTranslation", "incorrectGermanTranslations"]
          }
        }
      }
    });

    const jsonResponse = JSON.parse(response.text);

    if (!Array.isArray(jsonResponse)) {
      throw new Error("Invalid response format from API.");
    }

    const questions: Question[] = jsonResponse.map((item: any, index: number) => {
      const options = shuffleArray([...item.incorrectGermanTranslations, item.correctGermanTranslation]);
      return {
        id: `${Date.now()}-${index}`,
        promptSentence: item.targetLanguageSentence,
        options,
        correctAnswer: item.correctGermanTranslation,
      };
    });

    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech.");
  }
};