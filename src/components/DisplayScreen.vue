<!-- src/components/DisplayScreen.vue -->
<template>
  <el-card class="display-screen">
    <div class="header">
      <h2>{{ title }}</h2>
    </div>
    <div class="content">
      <p>{{ message }}</p>
      <p v-if="subMessage" class="sub-message">{{ subMessage }}</p>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

interface Props {
  title: string;
  message?: string;
  subMessage?: string;
}

const props = defineProps<Props>();
</script>

<style scoped>
.display-screen {
  width: 320px;
  padding: 20px;
  margin: 20px auto;
  text-align: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.display-screen:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

/* 标题样式 */
.header h2 {
  margin: 0 0 10px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 内容样式 */
.content p {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  word-wrap: break-word;
  font-family: 'Arial', sans-serif;
  margin: 0;
}

/* 子消息样式 */
.sub-message {
  font-size: 0.8rem !important;
  color: #666 !important;
  margin-top: 8px !important;
  font-style: italic;
}
</style>
