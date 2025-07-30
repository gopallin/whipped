# Contribution Guidelines for Whipped

This document provides the core coding principles and standards for the Whipped project. The goal is to create a codebase that is clear, maintainable, easily extendable, and well-tested.

## 1. Core Principles

-   **Clarity over Cleverness:** Code should be easy to read and understand. Avoid overly complex or obscure code for the sake of brevity.
-   **Single Responsibility Principle (SRP):** Every class, function, or module should have one, and only one, reason to change. Keep components small and focused on a single task.
-   **Extensibility:** Design components to be open for extension but closed for modification. Adding new functionality should not require rewriting existing, stable code.

## 2. No Hard-Coding (Configuration Management)

**This is a strict rule.** All configuration values must be managed through environment variables.

-   **DO NOT** commit secrets or environment-specific values (API keys, database passwords, hostnames, ports) directly into the code.
-   **DO** use the provided `.env` files for local development.
-   **DO** create a corresponding `.env.example` file that lists all required environment variables without their actual values.
-   Code should read configuration from the environment. For example, in Python use `os.getenv('MY_VARIABLE')` and in PHP use `env('MY_VARIABLE')`.

## 3. Code Style and Formatting

To ensure consistency, we will use industry-standard formatters and linters for each service.

-   **PHP (`user-service`):** Adhere to the **PSR-12** coding standard. Use `pint` to format the code.
-   **Python (`chatbot-service`, `notification-service`):** Follow the **PEP 8** style guide. Use tools like `black` for formatting and `flake8` for linting.
-   **TypeScript (`gateway-service`):** Use `prettier` for code formatting and `eslint` for linting to maintain a consistent style.

## 4. Testing

-   **Unit Tests are Required:** All new features, especially business logic, must be accompanied by unit tests.
-   **Test for Extensibility:** Tests should be written in a way that they don't break when unrelated changes are made. Use mocking and dependency injection to isolate the code under test.
-   **Focus on Business Logic:** Prioritize testing the core logic of each service rather than framework-specific implementations.

## 5. Key Architectural Patterns

### 5.1 Real-Time Response Streaming
To ensure a highly responsive user experience, the application uses an end-to-end streaming architecture for AI interactions.

-   **Concept:** Instead of waiting for the AI to generate a complete response, the backend requests a stream from the AI. The backend then immediately forwards the response to the frontend chunk-by-chunk. The frontend, in turn, progressively renders the text as it arrives.
-   **Benefit:** This makes the application feel significantly faster and more interactive, as the user sees the beginning of the response almost instantly.
-   **Implementation:**
    -   **Backend (`chatbot-service`):** Use `stream=True` when calling the Gemini API and use a generator (`yield`) to stream the response through a Flask `Response` object.
    -   **Frontend (`frontend-service`):** Use the `fetch` API to read the streaming response body and update the UI dynamically as new data chunks are received.
-   **Guideline:** When adding new AI-powered features, this streaming pattern should be the default choice to maintain a high-quality user experience.

By following these guidelines, we will build a robust and scalable application together.
