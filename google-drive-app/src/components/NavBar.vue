<template>
  <nav class="sidebar">
    <!-- Google Drive Logo -->
    <div class="logo">
      <!-- Optional: Drive Icon -->
      <i class="fab fa-google-drive"></i>
    </div>

    <ul>
      <li>
        <router-link to="/">
          <i class="fas fa-home icon"></i>
          <span>Home</span>
        </router-link>
      </li>
      <li v-if="isAuthenticated">
        <router-link to="/dashboard">
          <i class="fas fa-folder icon"></i>
          <span>Files</span>
        </router-link>
      </li>
      <li v-if="isAuthenticated">
        <button @click="logout">
          <i class="fas fa-sign-out-alt icon"></i>
          <span>Logout</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const isAuthenticated = ref(false);

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

    const logout = async () => {
      await axios.get("http://localhost:3000/logout", {
        withCredentials: true,
      });
      isAuthenticated.value = false;
      window.location.href = "/";
    };

    return { isAuthenticated, logout };
  },
};
</script>

<style>
/* Sidebar Container */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 80px;
  height: 100vh;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  transition: width 0.3s;
  overflow: hidden;
}

/* Hover to Expand */
.sidebar:hover {
  width: 200px;
}

/* Logo Area */
.logo {
  width: 50px;
  height: 50px;
  margin-bottom: 20px;
  font-size: 2rem;
  color: #fff;
}

/* Nav Items */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

li {
  width: 100%;
}

.sidebar a,
.sidebar button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  color: white;
  text-decoration: none;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

/* Hover States */
.sidebar a:hover,
.sidebar button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Icon & Text */
.icon {
  width: 30px;
  text-align: center;
  margin-right: 10px;
  font-size: 1.2rem;
}

/* Show Text on Hover */
.sidebar span {
  opacity: 0;
  transition: opacity 0.3s;
}

.sidebar:hover span {
  opacity: 1;
}
</style>
