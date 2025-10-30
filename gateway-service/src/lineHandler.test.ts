import { Client } from '@line/bot-sdk';

let axios: any; // Declare axios here
let mockedAxios: any; // Declare mockedAxios here

// Mock LINE Client
const mockReplyMessage = jest.fn();
const mockLineClient = {
  replyMessage: mockReplyMessage,
} as unknown as Client;

const userServiceUrl = 'http://localhost:8000';
const chatbotServiceUrl = 'http://localhost:5001';

let handleLineEvent: any; // Declare handleLineEvent here
let conversationHistory: Map<string, Array<{ sender: string; text: string }>>; // Declare conversationHistory here

describe('handleLineEvent', () => {
  beforeEach(() => {
    jest.resetModules(); // Reset modules to ensure fresh import of lineHandler
    jest.clearAllMocks();

    // Mock axios after resetting modules
    jest.doMock('axios', () => ({
      post: jest.fn(),
    }));
    axios = require('axios');
    mockedAxios = axios as jest.Mocked<typeof axios>;

    // Re-import handleLineEvent and conversationHistory after resetting modules
    const module = require('./lineHandler');
    handleLineEvent = module.handleLineEvent;
    conversationHistory = module.conversationHistory;
    conversationHistory.clear(); // Clear conversation history before each test
  });

  it('should return null for non-message events', async () => {
    const event = { type: 'follow', source: { userId: 'U123' } };
    const result = await handleLineEvent(event, mockLineClient, userServiceUrl, chatbotServiceUrl);
    expect(result).toBeNull();
    expect(mockReplyMessage).not.toHaveBeenCalled();
  });

  it('should return null for non-text message events', async () => {
    const event = { type: 'message', message: { type: 'image' }, source: { userId: 'U123' } };
    const result = await handleLineEvent(event, mockLineClient, userServiceUrl, chatbotServiceUrl);
    expect(result).toBeNull();
    expect(mockReplyMessage).not.toHaveBeenCalled();
  });

  it('should handle a successful text message event', async () => {
    const event = {
      type: 'message',
      message: { type: 'text', text: 'Hello' },
      replyToken: 'replyToken123',
      source: { userId: 'U123' },
    };

    mockedAxios.post
      .mockResolvedValueOnce({ data: { token: 'userToken123' } }) // Mock user service response
      .mockResolvedValueOnce({
        data: (async function* () {
          yield Buffer.from('AI Response');
        })(),
      }); // Mock chatbot service streaming response

    await handleLineEvent(event, mockLineClient, userServiceUrl, chatbotServiceUrl);

    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${userServiceUrl}/api/line-user`,
      { lineUserId: 'U123' },
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${chatbotServiceUrl}/api/chat`,
      { messages: [{ sender: 'user', text: 'Hello' }] }, // Only user message at this point
      {
        headers: { Authorization: 'Bearer userToken123' },
        responseType: 'stream',
      },
    );
    expect(mockReplyMessage).toHaveBeenCalledTimes(1);
    expect(mockReplyMessage).toHaveBeenCalledWith(
      'replyToken123',
      { type: 'text', text: 'AI Response' },
    );
  });

  it('should handle error from user service', async () => {
    const event = {
      type: 'message',
      message: { type: 'text', text: 'Hello' },
      replyToken: 'replyToken123',
      source: { userId: 'U123' },
    };

    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Unauthorized' } },
      config: { url: `${userServiceUrl}/api/line-user` },
    });

    await handleLineEvent(event, mockLineClient, userServiceUrl, chatbotServiceUrl);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockReplyMessage).toHaveBeenCalledTimes(1);
    expect(mockReplyMessage).toHaveBeenCalledWith(
      'replyToken123',
      { type: 'text', text: 'Error with user service: 401 - Unauthorized' },
    );
  });

  it('should handle error from chatbot service', async () => {
    const event = {
      type: 'message',
      message: { type: 'text', text: 'Hello' },
      replyToken: 'replyToken123',
      source: { userId: 'U123' },
    };

    mockedAxios.post
      .mockResolvedValueOnce({ data: { token: 'userToken123' } })
      .mockRejectedValueOnce({
        response: { status: 500, data: { message: 'AI Down' } },
        config: { url: `${chatbotServiceUrl}/api/chat` },
      });

    await handleLineEvent(event, mockLineClient, userServiceUrl, chatbotServiceUrl);

    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(mockReplyMessage).toHaveBeenCalledTimes(1);
    expect(mockReplyMessage).toHaveBeenCalledWith(
      'replyToken123',
      { type: 'text', text: 'Error with chatbot service: 500 - AI Down' },
    );
  });

  it('should maintain conversation history', async () => {
    const event1 = {
      type: 'message',
      message: { type: 'text', text: 'First message' },
      replyToken: 'replyToken1',
      source: { userId: 'U123' },
    };
    const event2 = {
      type: 'message',
      message: { type: 'text', text: 'Second message' },
      replyToken: 'replyToken2',
      source: { userId: 'U123' },
    };

    // Mock responses for first interaction
    mockedAxios.post
      .mockResolvedValueOnce({ data: { token: 'userToken123' } })
      .mockResolvedValueOnce({
        data: (async function* () {
          yield Buffer.from('AI Response 1');
        })(),
      });

    await handleLineEvent(event1, mockLineClient, userServiceUrl, chatbotServiceUrl);

    // Mock responses for second interaction
    mockedAxios.post
      .mockResolvedValueOnce({ data: { token: 'userToken123' } })
      .mockResolvedValueOnce({
        data: (async function* () {
          yield Buffer.from('AI Response 2');
        })(),
      });

    await handleLineEvent(event2, mockLineClient, userServiceUrl, chatbotServiceUrl);

    // Expect the second call to chatbot service to include full history up to the second user message
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${chatbotServiceUrl}/api/chat`,
      { messages: [
        { sender: 'user', text: 'First message' },
        { sender: 'ai', text: 'AI Response 1' },
        { sender: 'user', text: 'Second message' },
      ] },
      expect.any(Object),
    );
    expect(mockReplyMessage).toHaveBeenCalledTimes(2);
  });
});
