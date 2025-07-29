<script setup>
import { ref, nextTick, watch } from 'vue';
import api from '../services/api';

const newMessage = ref('');
const messages = ref([]);
const isLoading = ref(false);
const isListening = ref(false);
const isMicDisabled = ref(false);
const chatWindow = ref(null); // Create a ref for the chat window element

// --- Auto-Scroll Logic ---
const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
};

// Watch for changes in the messages array and scroll down
watch(messages, scrollToBottom, { deep: true });
// --- End Auto-Scroll ---


// --- Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const isSpeechRecognitionSupported = !!recognition;

if (isSpeechRecognitionSupported) {
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    newMessage.value = transcript;
    if (newMessage.value) {
      sendMessage();
    }
  };

  recognition.onspeechend = () => {
    stopListening();
  };

  recognition.onerror = (event) => {
    if (event.error === 'language-not-supported') {
      isMicDisabled.value = true;
      console.error("Speech recognition language not supported. Disabling microphone.");
    } else {
      console.error('Speech recognition error:', event.error);
    }
    stopListening();
  };

  recognition.onend = () => {
    if (isListening.value) {
        stopListening();
    }
  };
}

const toggleListening = () => {
  if (!isSpeechRecognitionSupported) return;
  if (isListening.value) {
    stopListening();
  } else {
    startListening();
  }
};

const startListening = () => {
  isListening.value = true;
  recognition.start();
};

const stopListening = () => {
  isListening.value = false;
  if (recognition) {
    recognition.stop();
  }
};
// --- End Speech Recognition ---


const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  const userMessage = {
    id: Date.now(),
    text: newMessage.value,
    sender: 'user',
  };
  messages.value.push(userMessage);

  const messageToSend = newMessage.value;
  newMessage.value = '';
  isLoading.value = true;

  try {
    const response = await api.sendMessage(messageToSend);
    const aiResponse = {
      id: Date.now() + 1,
      text: response.data.ai_response,
      sender: 'ai',
    };
    messages.value.push(aiResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    const errorResponse = {
      id: Date.now() + 1,
      text: 'Sorry, something went wrong.',
      sender: 'ai',
      isError: true,
    };
    messages.value.push(errorResponse);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="chat-container">
    <!-- The chat window now has the ref -->
    <div class="chat-window" ref="chatWindow">
      <div v-for="message in messages" :key="message.id" class="message" :class="['message-' + message.sender, { 'message-error': message.isError }]">
        <p>{{ message.text }}</p>
      </div>
      <div v-if="isLoading" class="message message-ai">
        <p>...</p>
      </div>
    </div>
    <div class="chat-input-area">
      <button
        v-if="isSpeechRecognitionSupported"
        @click="toggleListening"
        class="mic-button"
        :class="{ 'is-listening': isListening }"
        :disabled="isMicDisabled"
        :title="isMicDisabled ? 'Voice input is not supported or configured correctly on your system.' : 'Voice input'"
      >
        🎤
      </button>
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        :placeholder="isListening ? 'Listening...' : 'Type your message...'"
        :disabled="isLoading"
        class="text-input"
      />
      <button @click="sendMessage" :disabled="isLoading || !newMessage.trim()" class="send-button">Send</button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  /* Use the full viewport height minus the header height */
  height: calc(100vh - 62px); 
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  background-color: #f0f2f5;
}

.chat-window {
  flex-grow: 1; /* Allows the window to take up available space */
  padding: 20px;
  overflow-y: auto; /* This is key for scrolling */
}

.message {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  margin-bottom: 10px;
  word-wrap: break-word;
}

.message-user {
  background-color: #0084ff;
  color: white;
  align-self: flex-end;
}

.message-ai {
  background-color: #e4e6eb;
  color: #050505;
  align-self: flex-start;
}

.message-error {
    background-color: #e63946;
    color: white;
}

/* This is now a fixed footer */
.chat-input-area {
  display: flex;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ddd;
  background-color: #fff;
  /* The input area is no longer part of the scrolling content */
}

.text-input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 18px;
  padding: 10px 15px;
  font-size: 16px;
  margin: 0 10px;
}

.mic-button, .send-button {
  border: none;
  background-color: transparent;
  color: #0084ff;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

.send-button {
  font-size: 16px;
  font-weight: bold;
  color: #0084ff;
}

.mic-button.is-listening {
  color: #ff4500;
  animation: pulse 1.5s infinite;
}

.send-button:disabled {
  color: #a0c3ff;
  cursor: not-allowed;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
