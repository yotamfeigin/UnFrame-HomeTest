<template>
  <nav class="sidebar">
    <!-- Google Drive Logo -->
    <div class="logo">
      <!-- Optional: Drive Icon -->
      <i v-if="isAuthenticated" class="fa-solid fa-circle-user"></i>
      <i v-else class="fa-solid fa-user"></i>
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
          <i class="fab fa-google-drive"></i>
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
/* Sidebar Container */
.sidebar {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  width: 7%; /* Collapsed width */
  height: 100%;
  background: #1e1e1e;
  opacity: 0.9;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  transition: width 0.3s;
  overflow: hidden;
}

/* Hover to Expand */
.sidebar:hover {
  width: 15%; /* Expanded width */
}

/* Logo */
.logo {
  width: 50px;
  height: 50px;
  margin-bottom: 20px;
  font-size: 2rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center; /* Center icon+text in the link itself */
  gap: 0; /* No gap in collapsed state */
  padding: 15px;
  margin: 0 auto; /* Center horizontally within the <li> */
  color: white;
  text-decoration: none;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s, gap 0.3s, width 0.3s;
  width: auto; /* Let link shrink to fit icon when collapsed */
}
/* Hover States */
.sidebar a:hover,
.sidebar button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Icons */
.icon {
  font-size: 1.2rem;
  margin-right: 0; /* We'll manage spacing with the text reveal below */
  transition: margin-right 0.3s;
  /* No need for text-align since we're centering everything as a group */
}

/* Ensure the span behaves like a block for width transitions */
.sidebar span {
  display: inline-block;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  vertical-align: middle;
  transition: opacity 0.3s ease, max-width 0.3s ease, margin-left 0.3s ease;
}

.sidebar:hover span {
  opacity: 1;
  max-width: 200px; /* adjust to fit your text */
  margin-left: 10px;
}

</style>
