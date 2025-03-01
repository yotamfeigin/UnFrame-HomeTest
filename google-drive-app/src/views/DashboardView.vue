<template>
  <div class="dashboard">
    <h2>Your Google Drive Files</h2>

    <!-- Loading Logo -->
    <div v-if="isLoading" class="loading-container">
      <img src="../assets/loading.gif" alt="Loading..." />
    </div>

    <!-- FILE LIST with fade-in transition -->
    <transition-group
      name="file-fade"
      tag="div"
      class="file-list"
      v-if="!isLoading"
      appear
    >
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
    </transition-group>

    <!-- FLOATING CHAT BUTTON with reactive styling -->
    <div class="chat-fab" :class="{ active: chatOpen }" @click="toggleChat">
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
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  setup() {
    const router = useRouter();
    const files = ref([]);
    const chatOpen = ref(false);
    const messages = ref([]);
    const newMessage = ref("");
    const isLoading = ref(true);

    onMounted(async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true,
        });
        if (!data.authenticated) {
          return router.push("/");
        }
        const fileRes = await axios.get("http://localhost:3000/files", {
          withCredentials: true,
        });
        const fetchedFiles = fileRes.data;
        setTimeout(() => {
          files.value = fetchedFiles;
        }, 50);
      } catch (error) {
        console.error("Error checking auth or fetching files:", error);
        router.push("/");
      } finally {
        setTimeout(() => {
          isLoading.value = false;
        }, 100);
      }
    });

    const formatSize = (bytes) => {
      if (!bytes) return "Unknown";
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

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

    const toggleChat = () => {
      chatOpen.value = !chatOpen.value;
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;
      messages.value.push({ role: "user", content: newMessage.value });
      const userQuery = newMessage.value;
      newMessage.value = "";
      try {
        const { data } = await axios.post(
          "http://localhost:3000/chat",
          { prompt: userQuery },
          { withCredentials: true }
        );
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
      chatOpen,
      messages,
      newMessage,
      isLoading,
      formatSize,
      formatDate,
      viewFile,
      editFile,
      deleteFile,
      toggleChat,
      sendMessage,
    };
  },
};
</script>

<style>
/* MAIN DASHBOARD STYLES */
.dashboard {
  padding: 2rem;
  text-align: center;
  min-height: 100vh;
  background: #f5f5f5;
}

/* Loading Container */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
.loading-container img {
  width: 80px;
  height: auto;
}

/* FILE GRID */
.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  max-width: 1200px;
  margin: 0 auto;
  gap: 1rem;
}

/* FILE CARDS */
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

/* FILE FADE-IN TRANSITIONS */
.file-fade-appear-from,
.file-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.file-fade-appear-active,
.file-fade-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.file-fade-appear-to,
.file-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* FLOATING CHAT BUTTON */
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: background 0.3s, transform 0.3s;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
.chat-fab.active {
  background: linear-gradient(135deg, #007bff, #00c6ff);
  transform: rotate(45deg) scale(1.1);
}

/* SLIDE TRANSITION for Chat */
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

/* CHAT CONTAINER */
.chat-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 350px;
  max-height: 450px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

/* CHAT HEADER */
.chat-container header {
  background: linear-gradient(135deg, #007bff, #00c6ff);
  color: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-container header h2 {
  font-size: 1.1rem;
  margin: 0;
}
.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

/* CHAT MESSAGES */
.chat-messages {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f7f7f7;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.chat-bubble {
  padding: 10px 14px;
  border-radius: 20px;
  margin-bottom: 8px;
  max-width: 75%;
  word-wrap: break-word;
}
.chat-bubble.user {
  background: #dcf8c6;
  align-self: flex-end;
}
.chat-bubble.ai {
  background: #fff;
  align-self: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* CHAT FOOTER */
.chat-container footer {
  padding: 12px 16px;
  background: #eee;
  display: flex;
  gap: 8px;
  align-items: center;
}
.chat-container footer input {
  flex-grow: 1;
  padding: 8px 12px;
  font-size: 1rem;
  border: none;
  border-radius: 20px;
  outline: none;
  background: #fff;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
.chat-container footer button {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  font-size: 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}
.chat-container footer button:hover {
  background: #0056b3;
}
</style>
