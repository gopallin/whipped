import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- CORS Configuration ---
// We will allow requests from the frontend running on port 8081
const corsOptions = {
  origin: 'http://localhost:8090',
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
// --- End CORS Configuration ---

// Get service URLs from environment variables
const userServiceUrl = process.env.USER_SERVICE_URL;
const chatbotServiceUrl = process.env.CHATBOT_SERVICE_URL;

if (!userServiceUrl || !chatbotServiceUrl) {
    console.error('Error: Service URLs are not defined in the environment variables.');
    process.exit(1);
}

// Proxy middleware options
const userServiceProxy = createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    pathRewrite: {
        '^/api/user': '/api', // Rewrites /api/user to /api for the user-service
    },
});

const chatbotServiceProxy = createProxyMiddleware({
    target: chatbotServiceUrl,
    changeOrigin: true,
    pathRewrite: {
        '^/api/chatbot': '/api/chat', // Rewrites /api/chatbot to /api/chat for the chatbot-service
    },
});

// Apply the proxy middlewares
app.use('/api/user', userServiceProxy);
app.use('/api/chatbot', chatbotServiceProxy);

app.listen(port, () => {
    console.log(`Gateway service listening on port ${port}`);
    console.log(`Proxying /api/user to ${userServiceUrl}`);
    console.log(`Proxying /api/chatbot to ${chatbotServiceUrl}`);
});
