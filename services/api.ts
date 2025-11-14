/**
 * Generate German quiz questions using DeepSeek API
 * @param level Language level (A1, A2, B1, B2)
 * @param count Number of questions to generate
 */
export const generateGermanQuizQuestions = async (
  level: string = 'A1', 
  count: number = 5
): Promise<any[]> => {
  const apiKey = "sk-1fa9e391bb76492ab755ec0bb7ad378c";

  const prompt = `
Generate ${count} German language multiple-choice questions for ${level} level.
Return ONLY a JSON array without any other text.

Format each question like this:
{
  "question": "Question text in German",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Explanation in English"
}

Make questions about:
- Vocabulary
- Grammar  
- Common phrases
- German culture

Difficulty: ${level} level
  `;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    // محاولة parsing الـ JSON
    try {
      const questions = JSON.parse(responseText);
      return Array.isArray(questions) ? questions : [questions];
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse questions from AI response');
    }

  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};
