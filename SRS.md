# Software Requirements Specification (SRS) for Whipped

## 1. Introduction

### 1.1 Project Purpose
The "Whipped" project is a web-based conversational AI application. Its primary purpose is to provide users with a simple and intuitive interface to interact with an AI chatbot through text or voice input.

### 1.2 Scope
This document outlines the functional and non-functional requirements for the initial version of Whipped. The system will consist of a Vue.js frontend, a user management service, a chatbot service, and an API gateway to orchestrate communication.

## 2. Overall Description

### 2.1 Product Perspective
Whipped is a microservices-based application. A central API gateway will manage requests from the frontend and route them to the appropriate backend services, ensuring a decoupled and scalable architecture.

### 2.2 User Personas
The primary user is anyone looking for a quick and easy way to interact with a generative AI without complex setup or interfaces.

### 2.3 User Scenarios

#### 2.3.1 Scenario: First-Time Chat Interaction
1.  **Pre-conditions:** The user has navigated to the Whipped web application URL.
2.  **Scenario:**
    *   The user is presented with a minimalist interface, dominated by a text input field and a display area for the conversation.
    *   The user types a question, "What is the weather like in London today?", into the input field and presses "Send".
    *   The message appears in the conversation display area.
    *   The system processes the request and an AI-generated response, such as "The weather in London is currently sunny with a high of 22°C," appears in the display area.
3.  **Post-conditions:** The conversation history is visible on the screen.

#### 2.3.2 Scenario: Using Voice-to-Text Input
1.  **Pre-conditions:** The user is on the main chat screen.
2.  **Scenario:**
    *   The user clicks on a "microphone" icon next to the text input field.
    *   The browser may prompt for microphone access, which the user grants.
    *   The user speaks the sentence, "Tell me a fun fact about space."
    *   As the user speaks, the application transcribes the audio into text, which populates the input field.
    *   The user reviews the transcribed text and presses "Send".
    *   The AI responds with a fun fact, which is displayed on the screen.
3.  **Post-conditions:** The user has successfully used their voice to interact with the chatbot.

#### 2.3.3 Scenario: User Authentication
1.  **Pre-conditions:** The user has previously created an account.
2.  **Scenario:**
    *   To access their profile or saved history, the user navigates to a "Login" page.
    *   The user enters their email and password and clicks "Login".
    *   The `user-service` validates the credentials.
    *   Upon success, the user is redirected to the main chat interface, now in an authenticated state.
3.  **Post-conditions:** The user is logged in, and the system can now associate chat history and other data with their specific account.

## 3. System Architecture & Services

### 3.1 Frontend (`frontend-service`)
-   **Technology:** Vue.js
-   **Requirements:**
    -   Shall provide a single-page application (SPA) interface.
    -   Shall include a prominent text input field as the primary method for user interaction.
    -   Shall include a "Send" button to submit the text message.
    -   Shall include a display area for the chat conversation that automatically scrolls to the newest message.
    -   The header and input areas shall remain fixed on the screen while the chat content scrolls.
    -   Shall, as a secondary feature, include a microphone button to enable voice-to-text input.
    -   The voice recognition shall automatically stop after the user has finished speaking.
    -   Upon successful transcription, the message shall be sent automatically.

### 3.2 User Service (`user-service`)
-   **Technology:** PHP/Laravel
-   **Requirements:**
    -   Shall manage user data, including user registration and login credentials.
    -   Shall provide secure API endpoints for user creation, authentication, and profile retrieval.
    -   Shall issue JSON Web Tokens (JWT) upon successful login for authenticating subsequent API requests.

### 3.3 Chatbot Service (`chatbot-service`)
-   **Technology:** Python
-   **Requirements:**
    -   Shall expose an API endpoint to receive user messages.
    -   Shall process the message and interact with a third-party AI model to generate a response.
    -   Shall return the AI-generated response to the caller.

#### 3.3.1 Chatbot Personality and Behavior
-   **Personality:** The chatbot shall adopt the persona of an "inner voice" or "translator" for a high-maintenance girlfriend.
-   **Functionality:** The service's primary function is to interpret the subtext of statements made by the user (who is roleplaying as the girlfriend).
-   **Input/Output Logic:**
    -   **Input:** A statement from the "girlfriend."
    -   **Output:** The translated "inner voice" of that statement, revealing the true meaning or desire.
-   **Example Scenario:**
    -   **User Input:** "Oh, what bad weather."
    -   **Expected AI Response:** "The user means that they do not want to go out for lunch, and you should cook for them."

### 3.4 Gateway Service (`gateway-service`)
-   **Technology:** Node.js/TypeScript
-   **Requirements:**
    -   Shall act as the single entry point for all frontend API calls.
    -   Shall route requests to the appropriate downstream service (e.g., `/api/user` to `user-service`, `/api/chat` to `chatbot-service`).
    -   Shall forward authentication tokens (JWTs) from the client to the services.
