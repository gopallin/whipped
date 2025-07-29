<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div id="app-container">
    <header class="app-header">
      <h1>Girlfriend Translater</h1>
      <nav>
        <template v-if="isAuthenticated">
          <span class="user-info">Welcome, {{ user?.name }}</span>
          <button @click="handleLogout" class="nav-button">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link">Register</router-link>
        </template>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
}

#app {
  display: flex;
  justify-content: center;
}

#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.app-header {
  flex-shrink: 0; /* Prevent header from shrinking */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  z-index: 10;
}

.app-main {
  flex-grow: 1; /* Allow main content to take up available space */
  overflow-y: auto; /* The main area will scroll if content overflows */
}

.app-header h1 {
  margin: 0;
}

.nav-link, .nav-button {
  margin-left: 15px;
  text-decoration: none;
  color: #007bff;
  cursor: pointer;
}

.nav-button {
    border: none;
    background: none;
    font-size: 1em;
}

.user-info {
    margin-right: 15px;
}
</style>
