/**
 * Validates a DeepSeek API key by making a request to the models endpoint.
 * @param apiKey The DeepSeek API key to validate.
 * @returns A promise that resolves to true if the key is valid, and false otherwise.
 */
export const validateDeepSeekKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return true;
    }
    
    // Specifically check for 401 Unauthorized
    if (response.status === 401) {
      console.error('DeepSeek API key is invalid.');
      return false;
    }

    // Handle other non-ok responses
    console.error(`Failed to validate DeepSeek key. Status: ${response.status}`);
    return false;

  } catch (error) {
    console.error('Network or other error while validating DeepSeek key:', error);
    return false;
  }
};

interface DeepSeekMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface DeepSeekChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: DeepSeekMessage;
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}


/**
 * Sends a message to the DeepSeek API and returns the assistant's response.
 * Assumes the API key is set in the environment variables.
 * @param message The message to send to the assistant.
 * @returns A promise that resolves to the assistant's response string.
 * @throws An error if the API key is missing or if the API call fails.
 */
export const sendMessageToDeepSeek = async (message: string): Promise<string> => {
  // ✅✅✅ المفتاح مضاف هنا - بين علامتي التنصيص ✅✅✅
  const apiKey = "sk-1fa9e391bb76492ab755ec0bb7ad378c";

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY environment variable not set.");
  }

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
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`DeepSeek API request failed with status ${response.status}: ${errorBody}`);
    }

    const data: DeepSeekChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
      throw new Error("Invalid response format from DeepSeek API.");
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error sending message to DeepSeek:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to get response from DeepSeek: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with DeepSeek.');
  }
};
