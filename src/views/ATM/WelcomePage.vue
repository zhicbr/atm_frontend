<template>
  <div class="welcome-page">
    <DisplayScreen title="欢迎使用 AMT机" message="请插入您的银行卡" />
    <el-select
      v-model="selectedCardNumber"
      placeholder="选择银行卡"
      @change="onCardSelect"
      style="width: 300px; margin-top: 20px;"
    >
      <el-option
        v-for="card in cardsN"
        :key="card.cardNumber"
        :label="card.cardNumber"
        :value="card.cardNumber"
      />
    </el-select>
    <el-button
      type="primary"
      @click="proceedToPin"
      size="large"
      :disabled="!selectedCardNumber"
    >
      确定
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useATMStore } from '@/stores/atm';
import axios from 'axios'; // 引入 axios
import DisplayScreen from '@/components/DisplayScreen.vue';
import api from '@/api/api';

// 定义银行卡对象的类型
interface Card {
  cardNumber: string;
}

const userStore = useATMStore();
const router = useRouter();
const selectedCardNumber = ref<string | null>(null); // 选中的卡号，类型为字符串或 null
const cardsN = ref<Card[]>([]); // 初始化银行卡列表，类型为 Card 数组

// 在组件挂载时获取银行卡号
onMounted(async () => {
  try {
    const response = await api.post('/account/getAllCardNO');
    if (response.data.code === 1) {
      cardsN.value = response.data.data.map((cardNumber: string) => ({
        cardNumber, // 将卡号放入对象中
      }));
    } else {
      console.error('获取卡号失败:', response.data.msg);
    }
  } catch (error) {
    console.error('请求错误:', error);
  }
});

function onCardSelect(cardNumber: string) {
  // 保存选中的银行卡号到状态管理
  userStore.selectCardNumber(cardNumber); // 调用 selectCardNumber 方法
}

function proceedToPin() {
  // 进入 PIN 输入页
  router.push('/atm/pin-entry');
  userStore.setCurrentPage('/atm/pin-entry');
}

import { ElButton, ElMessage } from 'element-plus';
onMounted(() => {
  ElMessage.success('请插入银行卡……');

});
</script>

<style scoped>
.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.el-button {
  margin-top: 20px;
}
</style>
