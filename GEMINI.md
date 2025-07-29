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
