<!-- src/views/ExitPage.vue -->
<template>
    <div class="exit-page">
      <DisplayScreen title="感谢使用" message="请取回您的银行卡" />
      <el-button type="primary" @click="restart" size="large" style="margin-top: 20px;">
        重新开始
      </el-button>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import DisplayScreen from '@/components/DisplayScreen.vue';
  import { ElButton } from 'element-plus';
  import { useATMStore } from '@/stores/atm';
  import { ElMessage } from 'element-plus';
  import { onMounted } from 'vue';

  const router = useRouter();
  const userStore = useATMStore();

  function restart() {
    router.push('/');
    userStore.setCurrentPage('/atm/welcome');
    userStore.clearToken();

  }

onMounted(() => {
  ElMessage.success('请取回您的银行卡');
});

  </script>
  
  <style scoped>
  .exit-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  </style>
  