<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const password_confirmation = ref('');
const errorMessage = ref('');

const handleRegister = async () => {
  if (password.value !== password_confirmation.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  const success = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: password_confirmation.value,
  });

  if (success) {
    router.push('/login');
  } else {
    errorMessage.value = 'Registration failed. Please try again.';
  }
};
</script>

<template>
  <div class="auth-form">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label for="password_confirmation">Confirm Password</label>
        <input type="password" v-model="password_confirmation" required />
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.error-message {
  color: red;
}
</style>
