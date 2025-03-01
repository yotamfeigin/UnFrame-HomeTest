<template>
  <div class="landing">
    <h1>Welcome to Your Google Drive Dashboard</h1>
    <p>Access, manage, and chat about your files seamlessly.</p>

    <!-- Show button only if NOT authenticated -->
    <button v-if="!isAuthenticated" class="auth-btn" @click="authenticate">
      🔑 Connect to Google Drive
    </button>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const isAuthenticated = ref(false);

    onMounted(async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true,
        });
        isAuthenticated.value = data.authenticated;

        if (isAuthenticated.value) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    });

    const authenticate = () => {
      window.location.href = "http://localhost:3000/auth/google";
    };

    return { isAuthenticated, authenticate };
  },
};
</script>

<style>
/* 🌟 Full-screen landing page */
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
