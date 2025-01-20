<template>
    <div class="error-page">
      <h1>{{ errorTitle }}</h1>
      <p>{{ errorMessage }}</p>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElButton } from 'element-plus';
  import { useATMStore } from '@/stores/atm';

  
  const userStore = useATMStore();

  const router = useRouter();
  
  // 默认错误信息
  const errorTitle = ref('404 页面未找到');
  const errorMessage = ref('您访问的页面不存在，请检查URL或返回首页。');
  
  // 接收父组件传递的错误信息
  const props = defineProps({
    title: {
      type: String,
      default: '404 页面未找到',
    },
    message: {
      type: String,
      default: '您访问的页面不存在，请检查URL或返回首页。',
    },
  });
  
  // 使用父组件传递的错误信息
  errorTitle.value = props.title;
  errorMessage.value = props.message;
  
  function goBack() {
    router.go(-1); // 返回上一页
  }
  
  function goHome() {
    router.push({ name: 'Welcome' }); // 返回首页
    userStore.setCurrentPage('/atm/welcome');

  }
  </script>
  
  <style scoped>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    background-color: #f0f2f5;
    padding: 20px;
  }
  
  h1 {
    font-size: 36px;
    color: #333;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
  }
  
  .el-button {
    margin: 10px;
  }
  </style>