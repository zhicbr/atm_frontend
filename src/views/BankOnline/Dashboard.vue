<!-- Dashboard.vue -->
<template>
    <div class="dashboard-container">
      <h1>欢迎，{{ user.name }}</h1>
      <div class="dashboard-links">
      </div>
      <button @click="logout">退出登录</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { useBankOnlineStore } from '@/stores/bankonline';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    name: 'Dashboard',
    setup() {
      const userOnlineStore = useBankOnlineStore();
      const router = useRouter();
  
      const user = userOnlineStore.user;
  
      const logout = () => {
        userOnlineStore.clearToken();
        router.push('/login');
      };
  
      return {
        user,
        logout,
      };
    },
  });
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
    text-align: center;
  }
  
  .dashboard-links {
    margin-top: 20px;
  }
  
  .dashboard-links a {
    display: block;
    margin: 10px 0;
    color: #007bff;
    text-decoration: none;
  }
  
  .dashboard-links a:hover {
    text-decoration: underline;
  }
  
  button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>