<template>
  <div class="chat">
    <h1>AI Chat</h1>
    <div class="chat-box">
      <p v-for="message in messages" :key="message">{{ message }}</p>
    </div>
    <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Ask about your files..." />
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  setup() {
    const messages = ref([]);
    const newMessage = ref("");

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      messages.value.push(`You: ${newMessage.value}`);

      try {
        const { data } = await axios.post(
          "http://localhost:3000/chat",
          { prompt: newMessage.value },
          { withCredentials: true }
        );
        messages.value.push(`AI: ${data.response}`);
      } catch (error) {
        console.error("Chat error:", error);
        messages.value.push("AI: Error processing request.");
      }

      newMessage.value = "";
    };

    return { messages, newMessage, sendMessage };
  },
};
</script>

<style>
.chat {
  text-align: center;
  padding: 2rem;
}
.chat-box {
  height: 200px;
  border: 1px solid #ccc;
  overflow-y: auto;
  padding: 1rem;
}
input {
  padding: 10px;
  margin-top: 1rem;
}
button {
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background: #0056b3;
}
</style>
