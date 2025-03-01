<template>
  <div class="dashboard">
    <h2>Your Google Drive Files</h2>

    <!-- FILE LIST -->
    <div class="file-list">
      <div v-for="file in files" :key="file.id" class="file-card">
        <div class="file-details">
          <h3>{{ file.name }}</h3>
          <p><strong>Size:</strong> {{ formatSize(file.size) }}</p>
          <p><strong>Modified:</strong> {{ formatDate(file.modifiedTime) }}</p>
        </div>
        <div class="file-actions">
          <button @click="viewFile(file.id)">👁 View</button>
          <button @click="editFile(file.id, file.name)">✏ Edit</button>
          <button @click="deleteFile(file.id)">🗑 Delete</button>
        </div>
      </div>
    </div>

    <!-- FLOATING CHAT BUTTON -->
    <div class="chat-fab" @click="toggleChat">
      💬
    </div>

    <!-- SLIDE TRANSITION FOR CHAT -->
    <transition name="slide">
      <div v-if="chatOpen" class="chat-container">
        <header>
          <h2>AI Chat</h2>
          <button class="close-btn" @click="toggleChat">✕</button>
        </header>
        <div class="chat-messages">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['chat-bubble', msg.role]"
          >
            {{ msg.content }}
          </div>
        </div>
        <footer>
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Ask about your files..."
          />
          <button @click="sendMessage">Send</button>
        </footer>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    // FILES
    const files = ref([]);

    onMounted(async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/files", {
          withCredentials: true,
        });
        files.value = data;
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    });

    // FORMATTERS
    const formatSize = (bytes) => {
      if (!bytes) return "Unknown";
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

    // CRUD
    const viewFile = (fileId) => {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, "_blank");
    };

    const editFile = async (fileId, oldName) => {
      const newName = prompt("Enter new file name:", oldName);
      if (!newName || newName === oldName) return;

      try {
        await axios.patch(
          `http://localhost:3000/files/${fileId}`,
          { name: newName },
          { withCredentials: true }
        );
        alert("File renamed successfully!");
        location.reload();
      } catch (error) {
        console.error("Error renaming file:", error);
      }
    };

    const deleteFile = async (fileId) => {
      if (!confirm("Are you sure you want to delete this file?")) return;

      try {
        await axios.delete(`http://localhost:3000/files/${fileId}`, {
          withCredentials: true,
        });
        alert("File deleted successfully!");
        location.reload();
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    };

    // AI CHAT
    const chatOpen = ref(false);
    const messages = ref([]);
    const newMessage = ref("");

    const toggleChat = () => {
      chatOpen.value = !chatOpen.value;
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;
      // Add user message
      messages.value.push({ role: "user", content: newMessage.value });
      const userQuery = newMessage.value;
      newMessage.value = "";

      try {
        const { data } = await axios.post(
          "http://localhost:3000/chat",
          { prompt: userQuery },
          { withCredentials: true }
        );
        // Add AI response
        messages.value.push({ role: "ai", content: data.response });
      } catch (error) {
        console.error("Chat error:", error);
        messages.value.push({
          role: "ai",
          content: "Error occurred. Please try again.",
        });
      }
    };

    return {
      files,
      formatSize,
      formatDate,
      viewFile,
      editFile,
      deleteFile,
      chatOpen,
      messages,
      newMessage,
      toggleChat,
      sendMessage,
    };
  },
};
</script>

<style>
/* 🔹 MAIN DASHBOARD STYLES */
.dashboard {
  padding: 2rem;
  text-align: center;
  min-height: 100vh;
  background: #f5f5f5;
}

/* 🔹 FILE GRID (3 in a row) */
.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  max-width: 1200px;
  margin: 0 auto;
  gap: 1rem;
}

/* 🔹 FILE CARDS */
.file-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s;
}
.file-card:hover {
  transform: translateY(-5px);
}

.file-details h3 {
  font-size: 1.2rem;
  margin: 0;
}
.file-details p {
  font-size: 1rem;
  color: #666;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.file-actions button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.3s;
}
.file-actions button:hover {
  background: #0056b3;
}
.file-actions button:nth-child(2) {
  background: #ffc107;
}
.file-actions button:nth-child(2):hover {
  background: #e0a800;
}
.file-actions button:nth-child(3) {
  background: #dc3545;
}
.file-actions button:nth-child(3):hover {
  background: #c82333;
}

/* 🔹 FAB BUTTON */
.chat-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(45deg, #ff6f00, #ff9100);
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
  transform: scale(1.1);
}

/* 🔹 SLIDE TRANSITION */

/* The standard transition classes for 'slide' */
.slide-enter-from {
  transform: translateX(100%);
}
.slide-enter-to {
  transform: translateX(0);
}
.slide-enter-active {
  transition: transform 0.3s ease;
}

.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(100%);
}
.slide-leave-active {
  transition: transform 0.3s ease;
}

/* 🔹 CHAT CONTAINER */
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

/* 🔹 CHAT HEADER */
.chat-container header {
  background: #ff9100;
  color: #fff;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-container header h2 {
  margin: 0;
}
.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

/* 🔹 CHAT MESSAGES */
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
  background: #ffe0b2;
  float: left;
  text-align: left;
}

/* 🔹 CHAT FOOTER */
.chat-container footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #ccc;
}
.chat-container footer input {
  flex-grow: 1;
  padding: 0.5rem;
  font-size: 1rem;
}
.chat-container footer button {
  background: #ff6f00;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}
.chat-container footer button:hover {
  background: #ff9100;
}
</style>
