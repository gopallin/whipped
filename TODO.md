# Whipped Execution Plan

This document outlines the step-by-step development plan for the Whipped application, based on the SRS.

---

## **Step 1: Foundational Backend Setup (Completed)**

-   [x] **Task Group A: `user-service`**
-   [x] **Task Group B: `chatbot-service` (Mock)**
-   [x] **Task Group C: `gateway-service`**

---

## **Step 2: Frontend Scaffolding (Completed)**

-   [x] **2A. Create Vue.js Project**
-   [x] **2B. Build the UI Shell**
-   [x] **2C. API Client**
-   [x] **2D. Refine UI**

---

## **Step 3: Integration & Core Feature Completion (Completed)**

-   [x] **3A. Connect Frontend to Chatbot**
-   [x] **3B. Full AI Integration**
-   [x] **3C. User Authentication Flow**

---

## **Step 4: Advanced Features & Polish (In Progress)**

-   [x] **4A. Voice-to-Text Input**
-   [x] **4B. Final Testing and Refinement**
-   [x] **4C. Implement Auto-Stop for Voice Input**
-   [x] **4D. Implement Auto-Send for Voice Input**
-   [x] **4E. Implement Conversation History**
-   [ ] **4F. UI/UX Refinements (Current Task):**
    -   [ ] Implement a fixed header and footer layout.
    -   [ ] Implement automatic scrolling to the latest message.
-   [ ] **4F. Cross-Browser Compatibility:**
    -   [ ] Investigate and document why voice input fails in MS Edge.

---

## **Step 5: LINE Bot Integration (In Progress)**

-   [ ] **5A. Gateway Service - LINE Webhook Setup**
    -   [ ] 5A.1 Research LINE Messaging API SDK for Node.js.
    -   [ ] 5A.2 Install LINE SDK in `gateway-service`.
    -   [ ] 5A.3 Create new endpoint `/webhook/line` in `gateway-service` to receive LINE events.
    -   [ ] 5A.4 Implement basic webhook verification (signature check).
-   [ ] **5B. Gateway Service - Message Handling**
    -   [ ] 5B.1 Parse incoming LINE message events (text messages).
    -   [ ] 5B.2 Extract user ID and message text from LINE events.
    -   [ ] 5B.3 Forward user message to `chatbot-service` (reusing existing `/api/chat` endpoint).
    -   [ ] 5B.4 Receive AI response from `chatbot-service`.
    -   [ ] 5B.5 Format AI response into a LINE text message object.
    -   [ ] 5B.6 Send formatted message back to LINE Messaging API using SDK.
-   [ ] **5C. User Service - LINE User Management**
    -   [ ] 5C.1 Design strategy for mapping LINE user IDs to existing `user-service` users or creating new ones.
    -   [ ] 5C.2 Implement logic in `user-service` to store/retrieve LINE user IDs.
    -   [ ] 5C.3 Update `gateway-service` to interact with `user-service` for LINE user management.
-   [ ] **5D. Deployment & Configuration**
    -   [ ] 5D.1 Add LINE Channel Access Token and Channel Secret to `gateway-service/.env.example` and `.env`.
    -   [ ] 5D.2 Update Docker Compose to expose the LINE webhook endpoint if necessary.
    -   [ ] 5D.3 Configure LINE Developers Console with the webhook URL.
-   [ ] **5E. Testing & Refinement**
    -   [ ] 5E.1 Develop unit/integration tests for LINE webhook and message handling.
    -   [ ] 5E.2 Manual testing of LINE bot functionality.
    -   [ ] 5E.3 Refine error handling and user feedback for LINE.

---