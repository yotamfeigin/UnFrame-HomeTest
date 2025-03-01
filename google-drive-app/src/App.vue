<template>
  <div id="app">
    <NavBar />
    <div class="content">
      <transition name="fade" mode="out-in">
        <router-view :key="$route.fullPath"></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";

export default {
  components: { NavBar },
};
</script>

<style>
/* 🌟 App Layout */
#app {
  display: flex;
  height: 100%;
  width: 100%;
  font-family: Arial, sans-serif;
}

/* 🌟 Content Adjusted for Sidebar */
.content {
  flex-grow: 1;
  background: #f5f5f5;
}

/* Page transition styles */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
