export const sendMessageToDeepSeek = async (message: string): Promise<string> => {
  const apiKey = "sk-1fa9e391bb76492ab755ec0bb7ad378c";

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
            role: 'user',  // ⚠️ غيرت من system إلى user
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('Response Status:', response.status); // للتdebug

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response choices from DeepSeek API");
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error in sendMessageToDeepSeek:', error);
    throw error;
  }
};
