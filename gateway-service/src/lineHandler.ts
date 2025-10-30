import { Client } from '@line/bot-sdk';
import axios from 'axios';

// In-memory storage for conversation history. In a production environment, this would be a persistent store (e.g., Redis, database).
export const conversationHistory = new Map<string, Array<{ sender: string; text: string }>>();

export async function handleLineEvent(
  event: any,
  lineClient: Client,
  userServiceUrl: string,
  chatbotServiceUrl: string
) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;
  const userMessage = event.message.text;

  // Retrieve or initialize conversation history for the user
  const currentHistory = conversationHistory.get(userId) || [];

  try {
    // 1. Find or create user in user-service
    const userResponse = await axios.post(`${userServiceUrl}/api/line-user`, {
      lineUserId: userId,
    });
    const userToken = userResponse.data.token;

    // Add user's message to history
    currentHistory.push({ sender: 'user', text: userMessage });

    // 2. Forward message to chatbot-service with user token and full history
    const response = await axios.post(`${chatbotServiceUrl}/api/chat`, {
      messages: [...currentHistory],
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      responseType: 'stream',
    });

    let aiResponseText = '';
    for await (const chunk of response.data) {
      aiResponseText += chunk.toString();
    }

    // Add AI's response to history
    currentHistory.push({ sender: 'ai', text: aiResponseText });
    conversationHistory.set(userId, currentHistory);

    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: aiResponseText,
    });
  } catch (error: any) {
    console.error('Error in handleLineEvent:', error);
    let errorMessage = "Sorry, I couldn't process that right now.";

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.config.url.includes(userServiceUrl)) {
        errorMessage = `Error with user service: ${error.response.status} - ${error.response.data?.message || error.message}`;
      } else if (error.config.url.includes(chatbotServiceUrl)) {
        errorMessage = `Error with chatbot service: ${error.response.status} - ${error.response.data?.message || error.message}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      if (error.config.url.includes(userServiceUrl)) {
        errorMessage = 'User service is unreachable.';
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = `Request setup error: ${error.message}`;
    }

    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: errorMessage,
    });
  }
}