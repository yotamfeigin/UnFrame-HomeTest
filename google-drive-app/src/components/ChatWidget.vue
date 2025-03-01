<template>
  <div>
    <!-- Floating Button -->
    <div class="chat-fab" @click="toggleChat">
      💬
    </div>

    <!-- Slide Transition -->
    <transition name="slide">
      <!-- Chat Container (only show if open) -->
      <div class="chat-container" v-if="open">
        <header>
          <h2>AI Chat</h2>
          <button class="close-btn" @click="toggleChat">✕</button>
        </header>
        <div class="chat-messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['chat-bubble', message.role]"
          >
            {{ message.content }}
          </div>
        </div>
        <footer>
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type a question about your Drive files..."
          />
          <button @click="sendMessage">Send</button>
        </footer>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import { ref } from "vue";

export default {
  name: "ChatWidget",
  setup() {
    const open = ref(false);
    const messages = ref([]);
    const newMessage = ref("");

    const toggleChat = () => {
      open.value = !open.value;
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;
      // Add user message to chat
      messages.value.push({ role: "user", content: newMessage.value });
      const userQuery = newMessage.value;
      newMessage.value = "";

      try {
        // Send request to your backend's /chat endpoint
        const { data } = await axios.post(
          "http://localhost:3000/chat",
          { prompt: userQuery },
          { withCredentials: true }
        );
        // Add AI response to chat
        messages.value.push({ role: "ai", content: data.response });
      } catch (error) {
        console.error("Chat error:", error);
        messages.value.push({ role: "ai", content: "Error occurred. Please try again." });
      }
    };

    return { open, messages, newMessage, toggleChat, sendMessage };
  },
};
</script>

<style scoped>
/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s;
}
.slide-enter {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(100%);
}

/* Floating FAB */
.chat-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #007bff;
  color: #fff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: 0.3s;
}
.chat-fab:hover {
  background: #0056b3;
}

/* Chat Container */
.chat-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}

/* Header */
header {
  background: #007bff;
  color: #fff;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header h2 {
  margin: 0;
}
.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

/* Messages */
.chat-messages {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}
.chat-bubble {
  display: inline-block;
  margin: 0.5rem 0;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  max-width: 70%;
  clear: both;
}
.chat-bubble.user {
  background: #e5e5e5;
  float: right;
  text-align: right;
}
.chat-bubble.ai {
  background: #d0ebff;
  float: left;
  text-align: left;
}

/* Footer */
footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #ccc;
}
footer input {
  flex-grow: 1;
  padding: 0.5rem;
  font-size: 1rem;
}
footer button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}
footer button:hover {
  background: #0056b3;
}
</style>
