<template>
  <div class="transaction-receipt">
    <DisplayScreen :title="receiptTitle" :message="receiptMessage" />
    <el-button type="primary" @click="printReceipt" size="large" style="margin-top: 20px;">
      打印凭证
    </el-button>
    <el-button type="success" @click="backToMenu" size="large" style="margin-top: 10px;">
      返回主菜单
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DisplayScreen from '@/components/DisplayScreen.vue';
import { ElButton, ElMessage } from 'element-plus';
import { useATMStore } from '@/stores/atm';
import html2pdf from 'html2pdf.js';

const userStore = useATMStore();
const route = useRoute();
const router = useRouter();

// 获取交易信息
const { type, amount, recipient } = defineProps<{
  type: string;
  amount: string;
  recipient?: string;
}>();

// 获取 ATM 位置
const atmLocation = computed(() => userStore.atm.location);

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 根据交易类型设置凭证标题
const receiptTitle = computed(() => {
  switch (type) {
    case 'withdrawal':
      return '取款成功';
    case 'deposit':
      return '存款成功';
    case 'transfer':
      return '转账成功';
    default:
      return '交易成功';
  }
});

// 凭证内容
const receiptMessage = computed(() => {
  let message = `金额: ¥${amount}\n`;
  if (recipient) {
    message += `收款人账号: ${recipient}\n`;
  }
  message += `ATM位置: ${atmLocation.value}\n`;
  message += `交易时间: ${getCurrentTime()}\n`;
  message += '感谢使用 ATM机 服务！';
  return message;
});

// 打印凭证并生成 PDF
function printReceipt() {
  ElMessage.success('正在打印凭条，请稍后……');
  ElMessage.success('请取走您的凭条');

  const element = document.createElement('div');
  element.innerHTML = `
<div class="receipt-container">
  <header>
    <h1>交易凭证</h1>
  </header>
  <section class="transaction-details">
    <p><strong>账户卡号:</strong> ${userStore.selectedCard.cardNumber}</p>
    <p><strong>交易金额:</strong> ¥${amount}</p>
    <p><strong>交易类型:</strong> ${receiptTitle.value}</p>
    ${recipient ? `<p><strong>对方账户:</strong> ${recipient}</p>` : ''}
    <p><strong>手续费:</strong> 无</p>
    <p><strong>ATM位置:</strong> ${atmLocation.value}</p>
    <p><strong>交易时间:</strong> ${getCurrentTime()}</p>
  </section>
  <footer>
    <p>感谢使用 ATM机 服务！</p>
  </footer>
</div>
<style>
.receipt-container {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

header {
  text-align: center;
  margin-bottom: 20px;
}

.transaction-details {
  line-height: 1.6;
  margin-bottom: 20px;
}

footer {
  text-align: center;
  font-size: 0.9em;
  color: #555;
}

</style>
  `;

  // 使用 html2pdf.js 生成 PDF
  html2pdf()
    .from(element)  // 将 HTML 内容传递给 html2pdf
    .save('transaction_receipt.pdf');  // 下载 PDF
}

// 返回主菜单
function backToMenu() {
  router.push('/atm/mainatm/mainmenu');
  userStore.setCurrentPage('/atm/mainatm/mainmenu');
}
</script>

<style scoped>
.transaction-receipt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  white-space: pre-line; /* 保持换行符 */
}
</style>
