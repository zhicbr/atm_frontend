<!-- src/views/BalanceInquiry.vue -->
<template>
  <div class="balance-inquiry">
    <DisplayScreen title="账户余额" :message="`¥${balance}`" />
    <el-button type="primary" @click="backToMenu" size="large">
      返回主菜单
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useATMStore } from '@/stores/atm';
import { useRouter } from 'vue-router';
import DisplayScreen from '@/components/DisplayScreen.vue';
// import axios from 'axios';
import api from '@/api/api';

const userStore = useATMStore();
const router = useRouter();
const balance = ref('查询中...');
const cardNo = userStore.selectedCard.cardNumber; // 从 store 获取当前卡号
const token = userStore.token; // 从 store 获取 token
// 定义查询余额的方法
async function fetchBalance() {
  try {
    const response = await api.get(`/account/getBalance/${cardNo}`, {
      headers: { token },
    });

    if (response.data.code === 1 && response.data.data) {
      // 提取返回的余额信息
      balance.value = response.data.data.replace('账户余额为：', '');
 // 提取返回的余额数字
      const balanceString = response.data.data.replace('账户余额为：', '').trim();
      const parsedBalance = parseFloat(balanceString); // 将字符串转换为数字
      userStore.selectBalance(parsedBalance); // 将余额存储到 store

    } else {
      balance.value = '查询失败，请稍后重试';
    }
  } catch (error) {
    console.error('查询余额失败:', error);
    balance.value = '查询失败，请稍后重试';
  }
}

// 页面加载时查询余额
onMounted(() => {
  fetchBalance();
});

// 返回主菜单的方法
function backToMenu() {
  router.push('/atm/mainatm/mainmenu');
  userStore.setCurrentPage('/atm/mainatm/mainmenu');
}
</script>

<style scoped>
.balance-inquiry {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.el-button {
  margin-top: 20px;
}
</style>
