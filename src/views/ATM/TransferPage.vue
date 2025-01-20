<!-- src/views/TransferPage.vue -->
<template>
  <div class="transfer-page">
    <DisplayScreen title="转账" :message="transferInfo" />
    <NumericKeypad @input="addAmount" @clear="clearAmount" :disabled="isAccountFrozen" />
    <el-input
      v-model="recipient"
      placeholder="请输入收款人账号"
      style="width: 300px; margin-top: 20px;"
      :disabled="isAccountFrozen"
    />
    <div style="display: flex; align-items: center; gap: 10px;">
      <el-button
        type="success"
        @click="confirmTransfer"
        :disabled="!isValidTransfer || isAccountFrozen"
        size="large"
        style="margin-top: 20px;"
      >
        确认转账
      </el-button>
      <el-button 
        type="primary" 
        @click="backToMenu" 
        size="large"
        style="margin-top: 20px;"
      >
        返回主菜单
      </el-button>
    </div>
    <el-alert
      v-if="error"
      title="转账失败，请重试"
      type="error"
      show-icon
      closable
      @close="error = false"
      style="margin-top: 0px;"   
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useATMStore } from '@/stores/atm';
import DisplayScreen from '@/components/DisplayScreen.vue';
import NumericKeypad from '@/components/NumericKeypad.vue';
import { ElButton, ElInput, ElAlert, ElMessage } from 'element-plus';
// import axios from 'axios'; 
import api from '@/api/api';

const router = useRouter();
const userStore = useATMStore();
const token = userStore.token; 
const cardNo = userStore.selectedCard.cardNumber;

const amount = ref<string>('');
const recipient = ref<string>('');
const error = ref<boolean>(false);
const isAccountFrozen = ref(false);

const transferInfo = computed(() => {
  if (isAccountFrozen.value) {
    return '您的账户已被冻结，无法进行转账';
  }
  return amount.value
    ? `转账金额: ¥${amount.value}`
    : '请输入转账金额';
});

const isValidTransfer = computed(() => {
  const num = parseInt(amount.value, 10);
  const recipientLength = recipient.value.trim().length; // 修剪收款人账号前后空格
  return (
    !isNaN(num) && 
    num > 0 && 
    num <= userStore.selectedCard.balance && 
    recipientLength > 0 && 
    recipientLength <= 20 // 限制收款人账号长度（最大20个字符）
  );
});

function backToMenu() {
  router.push('/atm/mainatm/mainmenu');
  userStore.setCurrentPage('/atm/mainatm/mainmenu');
}

function addAmount(key: string) {
  if (!isAccountFrozen.value && amount.value.length < 6 && /^\d+$/.test(amount.value + key)) {
    amount.value += key;
  }
}

function clearAmount() {
  amount.value = '';
  error.value = false;
}

async function confirmTransfer() {
  if (isAccountFrozen.value) {
    ElMessage.error('您的账户已被冻结，无法进行转账操作');
    return;
  }

  if (recipient.value === cardNo) { // 判断转账给自己
    ElMessage.error('无法给自己转账');
    return;
  }

  const transferAmount = parseInt(amount.value, 10);

  try {
    const response = await api.put('/account/transaction', {
      cardNo1: cardNo, 
      cardNo2: recipient.value,
      money: transferAmount,
    }, {
      headers: {
        token: token, 
      }
    });

    if (response.data.code === 1) {
      userStore.deductBalance(transferAmount);
      router.push({
        name: 'TransactionReceipt',
        params: {
          type: 'transfer',
          amount: transferAmount.toString(),
          recipient: recipient.value,
        },
      });
      userStore.setCurrentPage('/atm/mainatm/transactionreceipt');
    } else {
      error.value = true; 
    }
  } catch (e) {
    error.value = true; 
  }
}

async function checkAccountStatus() {
  try {
    const response = await api.get(`/account/getAccountStatus/${cardNo}`, {
      headers: { token },
    });

    if (response.data.code === 1) {
      if (response.data.data.includes('frozen')) {
        isAccountFrozen.value = true;
        ElMessage.error('您的银行卡已被冻结，无法进行转账操作');
      } else {
        isAccountFrozen.value = false;
      }
    }
  } catch (error) {
    console.error('检查账户状态失败:', error);
    ElMessage.error('检查账户状态失败，请稍后重试');
  }
}

const balance = ref('查询中...');

async function fetchBalance() {
  try {
    const response = await api.get(`/account/getBalance/${cardNo}`, {
      headers: { token },
    });

    if (response.data.code === 1 && response.data.data) {
      const balanceString = response.data.data.replace('账户余额为：', '').trim();
      const parsedBalance = parseFloat(balanceString);
      userStore.selectBalance(parsedBalance);
    } else {
      balance.value = '查询失败，请稍后重试';
    }
  } catch (error) {
    console.error('查询余额失败:', error);
    balance.value = '查询失败，请稍后重试';
  }
}

// 页面加载时检查账户状态、查询余额并提示输入收款人卡号
onMounted(async () => {
  await checkAccountStatus(); // 等待账户状态检查完成
  fetchBalance(); // 查询账户余额
  
  if (!isAccountFrozen.value) { // 确保此时状态已正确更新
    ElMessage.success('请输入收款人的卡号……');
  }
});

</script>

<style scoped>
.transfer-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
