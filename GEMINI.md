# Gemini Project Reference: Whipped

This document is a technical reference for AI assistants working on the Whipped project. It outlines the project structure, services, dependencies, and essential commands.

## 1. Project Overview

Whipped is a microservices-based conversational AI application. It consists of a frontend, an API gateway, and several backend services. The core user experience involves a user (roleplaying as a "high-maintenance girlfriend") providing statements, which an AI then translates into their "true" meaning.

## 2. Service Architecture

The project is composed of the following services:

| Service Name | Directory | Purpose | Technology | Port |
| :--- | :--- | :--- | :--- | :--- |
| **Gateway Service** | `gateway-service/` | Single entry point for all API requests. Routes traffic to other services. | Node.js w/ TypeScript | `3000` |
| **User Service** | `user-service/` | Manages user authentication (registration, login) and data. | PHP w/ Laravel | `8000` |
| **Chatbot Service** | `chatbot-service/` | Handles chat logic by calling the Gemini AI to provide "translations". | Python w/ Flask | `5001` |
| **Frontend Service** | `frontend-service/` | The Vue.js single-page application that the user interacts with. | Vue.js | `5173` |

### Service Dependencies:
-   The **Frontend Service** communicates exclusively with the **Gateway Service**.
-   The **Gateway Service** routes requests to the **User Service** and **Chatbot Service**.
-   The **Chatbot Service** communicates with the external Google Gemini API.

## 3. Software Versions & Key Libraries

-   **`gateway-service`**:
    -   Node.js: `^20.19.0 || >=22.12.0`
    -   TypeScript: `^5.8.3`
    -   Express: `^4.17.1`
    -   `http-proxy-middleware`: `^2.0.0`
-   **`user-service`**:
    -   PHP: `^8.2`
    -   Laravel: `^12.0`
    -   `tymon/jwt-auth`: `^2.2`
-   **`chatbot-service`**:
    -   Python: `3.9+` (system dependent)
    -   Flask: `2.0.1`
    -   `google-generativeai`: `0.4.0`
-   **`frontend-service`**:
    -   Node.js: `^20.19.0 || >=22.12.0`
    -   Vue: `^3.5.8`
    -   Vite: `^7.0.6`
    -   Axios: `^1.7.7`
    -   Pinia: `^2.2.2`

## 4. Development Commands

To run the entire application for development, execute the following commands from the project root in separate terminal sessions.

-   **Start User Service:**
    ```bash
    cd user-service
    php artisan serve
    ```

-   **Start Chatbot Service:**
    ```bash
    cd chatbot-service
    pip install -r requirements.txt # If dependencies are not installed
    python3 app.py
    ```

-   **Start Gateway Service:**
    ```bash
    cd gateway-service
    npm install # If dependencies are not installed
    npm run dev
    ```

-   **Start Frontend Service:**
    ```bash
    cd frontend-service
    npm install # If dependencies are not installed
    npm run dev
    ```
    > The frontend is accessible at **http://localhost:5173**.

## 5. Docker Commands

The project is fully containerized using Docker and `docker-compose`.

-   **Build and Start All Services:**
    *From the project root, run:*
    ```bash
    docker-compose up --build
    ```
    *To run in detached mode, add the `-d` flag.*

-   **Stop All Services:**
    ```bash
    docker-compose down
    ```

-   **View Logs for a Specific Service:**
    ```bash
    docker-compose logs -f <service_name>
    # Example: docker-compose logs -f user-service
    ```

-   **Access a Service's Shell:**
    ```bash
    docker-compose exec <service_name> bash
    # Example: docker-compose exec chatbot-service bash
    ```

## 6. Quality & Verification Commands

Run these commands from within the respective service's directory to ensure code quality and correctness.

-   **`user-service` (Laravel):**
    -   **Test:** `composer test`
    -   **Format:** `composer pint`
    -   **Clear Cache:** `php artisan config:clear`

-   **`chatbot-service` (Python):**
    -   **Test:** `python3 -m pytest` *(pytest not yet installed)*
    -   **Lint/Format:** `flake8 . && black .` *(flake8/black not yet installed)*

-   **`gateway-service` & `frontend-service` (Node.js):**
    -   **Test:** `npm test` *(Test runner not yet configured)*
    -   **Format:** `npx prettier --write .`

## 7. Key Configuration Notes

-   **Gemini API Key:** The API key for the AI is stored in `chatbot-service/.env` under the variable `GEMINI_API_KEY`.
-   **Database:** The `user-service` uses a SQLite database located at `user-service/database/database.sqlite`.
-   **Service URLs:** The `gateway-service` finds other services using the URLs in its `.env` file.

## 8. Core Architecture: End-to-End Response Streaming

To provide a real-time, responsive user experience, the application implements an end-to-end streaming architecture. Instead of making the user wait for the AI to generate a full response, we stream the response token-by-token from the AI, through our backend, and directly to the user's browser.

### 8.1 How It Works: A Step-by-Step Explanation

Imagine the user types a message and hits "Send".

1.  **`ChatView.vue` (The UI):**
    *   The `sendMessage` method is called.
    *   It immediately adds the user's message and an empty AI message placeholder to the chat window.
    *   It then calls the `api.streamChat` function, providing a callback that will append incoming text to the AI message placeholder.

2.  **`api.js` (The Frontend's API Service):**
    *   The `streamChat` function uses the browser's native `fetch` API to make a `POST` request to the `gateway-service`.
    *   It gets a `ReadableStream` from the response body and uses a `while` loop to read chunks of data as they arrive.
    *   Each chunk is decoded into text and passed to the callback function from `ChatView.vue`, which updates the UI in real-time.

3.  **`routes.py` (The Chatbot Service's API):**
    *   The `/api/chat` endpoint receives the request.
    *   Instead of calling the AI handler and waiting for a complete string, it returns a Flask `Response` object configured to stream.
    *   It uses a generator function that calls the `ai_handler` and `yields` each chunk of text it receives.

4.  **`ai_handler.py` (The AI Communicator):**
    *   This is where the streaming originates. The `generate_content` call to the Google Gemini API includes the parameter `stream=True`.
    *   This tells the Gemini API to send back each part of the response as soon as it's generated.
    *   The function uses a `for` loop to iterate over the streaming response from the AI and `yields` each piece back to the `routes.py` generator.

This creates a continuous flow of data from the AI to the user's screen, making the application feel instantaneous.

### 8.2 Key Code Snippets

**`ai_handler.py`: Requesting the stream from Gemini**
```python
responses = model.generate_content(
    prompt,
    stream=True, # Tells the AI to stream its response
    request_options={"timeout": 60}
)
for response in responses:
    yield response.text # Yields each chunk as it arrives
```

**`routes.py`: Streaming the response from Flask**
```python
def generate():
    for chunk in get_ai_translation(user_message, current_app.logger):
        yield chunk

# Return a streaming response instead of a JSON object
return Response(stream_with_context(generate()), mimetype='text/plain')
```

**`api.js`: Reading the stream on the frontend**
```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break; // Stream is finished
  const chunk = decoder.decode(value, { stream: true });
  onChunkReceived(chunk); // Pass the chunk to the UI
}
```

**`ChatView.vue`: Updating the UI with the stream**
```javascript
// In sendMessage():
const aiResponse = { id: Date.now() + 1, text: '', sender: 'ai' };
messages.value.push(aiResponse);

await api.streamChat(messageToSend, (chunk) => {
  const targetMessage = messages.value.find(m => m.id === aiResponse.id);
  if (targetMessage) {
    targetMessage.text += chunk; // Append the new chunk to the message text
  }
});
```
