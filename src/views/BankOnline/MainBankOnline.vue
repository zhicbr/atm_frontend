<!-- src/views/MainBankOnline.vue -->
<template>
  <div class="main-container">
    <Sidebar />
    <div class="content-wrapper">
      <h1>银行后台管理系统</h1>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.main-container {
  display: flex;
  min-height: 100vh;
}

.content-wrapper { /* bankonline内容区域，不包括侧边栏 */
  flex: 1;
  padding: 20px;
  margin-left: 230px; /* 初始状态下的左边距 */
  transition: margin-left 0.3s ease;
}

/* 当侧边栏折叠时的样式 */
:deep(.sidebar.collapsed) ~ .content-wrapper {
  margin-left: 90px;   /* 折叠后的左边距 */
}

h1 {
  color: #007bff;
  text-align: left;
  margin-top: 20px;
  margin-left: 20px; /* 添加左边距 */
}
</style>