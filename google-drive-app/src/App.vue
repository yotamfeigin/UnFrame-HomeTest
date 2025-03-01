<template>
  <div id="app">
    <NavBar />
    <div class="content">
      <router-view></router-view>
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
  margin-left: 80px; /* Same width as sidebar */
  flex-grow: 1;
  background: #f5f5f5;
}
</style>
