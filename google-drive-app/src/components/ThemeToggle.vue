<template>
  <button @click="toggleTheme" class="fixed top-4 right-4 p-2 bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 rounded-md shadow-md">
    {{ isDark ? '🌙 Dark Mode' : '☀️ Light Mode' }}
  </button>
</template>

<script>
export default {
  data() {
    return {
      isDark: localStorage.getItem("theme") === "dark",
    };
  },
  mounted() {
    document.documentElement.classList.toggle("dark", this.isDark);
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      document.documentElement.classList.toggle("dark", this.isDark);
      localStorage.setItem("theme", this.isDark ? "dark" : "light");
    },
  },
};
</script>
