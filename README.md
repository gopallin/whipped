# Whipped  whipped

Whipped is a fun, microservices-based web application that acts as a humorous "translator" for a high-maintenance girlfriend's statements. It uses a generative AI to reveal the true, underlying meaning behind her words.

## ✨ Features

-   **AI-Powered Translations:** Leverages Google's Gemini AI to interpret user input.
-   **Streaming Responses:** The AI's response is streamed token-by-token, providing a real-time, responsive user experience.
-   **Simple Chat Interface:** A clean, modern UI for text-based interaction.
-   **Voice Input:** Voice-to-text transcription for hands-free use.

## 🛠️ Tech Stack

| Service | Technology |
| :--- | :--- |
| **Frontend** | Vue.js, Vite |
| **API Gateway** | Node.js, Express, TypeScript |
| **User Service** | PHP, Laravel |
| **Chatbot Service** | Python, Flask |
| **AI Model** | Google Gemini |
| **Containerization** | Docker, Docker Compose |

## 🚀 Getting Started

This project is designed to be run with Docker, but can also be run locally for development.

**For a complete technical overview, including setup instructions, development commands, and Docker usage, please see the comprehensive project reference in [`GEMINI.md`](./GEMINI.md).**

## 🌐 Browser Compatibility

This application has been tested and is fully functional in the latest version of **Google Chrome** on macOS.

-   **Voice Input:** The Web Speech API used for voice input is an experimental technology.
    -   ✅ **Google Chrome:** Fully supported.
    -   ⚠️ **Microsoft Edge:** May not work. The feature will be gracefully disabled if the browser reports that it is not supported.
    -   ❌ **Other Browsers:** Not tested.