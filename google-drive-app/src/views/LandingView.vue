<template>
  <div class="landing">
    <h1>Welcome to Your Google Drive Dashboard</h1>
    <p>Access, manage, and chat about your files seamlessly.</p>

    <!-- Show button only if NOT authenticated -->
    <button v-if="!isAuthenticated" class="auth-btn" @click="authenticate">
      🔑 Connect to Google Drive
    </button>
    <!-- If authenticated, show Google Drive icon -->
    <button v-else class="auth-btn" @click="goToDashboard">
      <i class="fab fa-google-drive"></i> Access your files
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const isAuthenticated = ref(false);

    // Check the authentication status when component mounts
    onMounted(async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true,
        });
        isAuthenticated.value = data.authenticated;
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    });

    const authenticate = () => {
      window.location.href = "http://localhost:3000/auth/google";
    };
// For authenticated users: redirect to /dashboard
    const goToDashboard = () => {
      window.location.href = "/dashboard";
    };

    return { isAuthenticated, authenticate, goToDashboard };
  },
};
</script>

<style>
/* Styles remain unchanged */
.landing {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #007bff, #6a11cb);
  color: white;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.auth-btn {
  background: white;
  color: #007bff;
  font-size: 1.2rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.auth-btn:hover {
  background: #f0f0f0;
}
</style>
