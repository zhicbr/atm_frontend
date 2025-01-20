<!-- src/views/adminchat.vue -->
<template>
    <div class="adminchat-container">
      <h2>聊天窗口</h2>
      <!-- 嵌入 chatpage.vue -->
      <ChatPage />
    </div>
  </template>
  
  <script setup>
  import ChatPage from '@/components/ChatPage.vue';
  </script>
  
  <style scoped>
  .adminchat-container {
    display: flex;
    flex-direction: column;
    height: 90%;
    background-color: #f0f2f5;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    padding: 10px;
    padding-right: 80px;

  }
  
  h2 {
    text-align: center;
    color: #1890ff;
    margin-bottom: 10px;
    font-size: 1.5rem;
  }
  </style>
  