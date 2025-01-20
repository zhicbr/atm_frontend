<!-- src/views/Withdrawal.vue -->
<template>
  <div class="withdrawal">
    <DisplayScreen 
      title="取款金额" 
      :message="message" 
      :sub-message="subMessage"
    />
    <NumericKeypad @input="addAmount" @clear="clearAmount" :disabled="isAccountFrozen" />
    <div style="display: flex; align-items: center; gap: 10px;">
      <el-button
        type="success"
        @click="confirmWithdrawal"
        :disabled="!isValidAmount || isAccountFrozen"
        size="large"
        style="margin-top: 20px;"
      >
        确认取款
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
      title="余额不足、输入金额有误或取款失败"
      type="error"
      show-icon
      closable
      @close="error = false"
      style="margin-top: 10px;"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useATMStore } from '@/stores/atm';
import DisplayScreen from '@/components/DisplayScreen.vue';
import NumericKeypad from '@/components/NumericKeypad.vue';
import api from '@/api/api';
import { ElButton, ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useATMStore();

const amount = ref<string>('');
const error = ref<boolean>(false);
const isAccountFrozen = ref(false);

const message = computed(() => {
  if (isAccountFrozen.value) {
    return '您的账户已被冻结，无法使用取款功能';
  }
  return amount.value || '请输入取款金额';
});

// 添加辅助提示信息
const subMessage = computed(() => {
  if (amount.value) {
    const num = parseInt(amount.value, 10);
    if (num > 10000) {
      return '单次取款金额不能超过1万元';
    }
    if (num % 100 !== 0) {
      return '暂无零钞，请输入100的倍数金额';
    }
  }
  return '单次取款限额1万元，仅支持100元面额';
});

const cardNo = userStore.selectedCard.cardNumber;
const token = userStore.token;

// 校验取款金额是否有效
const isValidAmount = computed(() => {
  const num = parseInt(amount.value, 10);
  return (
    !isNaN(num) && 
    num > 0 && 
    num <= userStore.selectedCard.balance && 
    num <= 10000 && // 添加1万限制
    num % 100 === 0 // 确保是100的倍数
  );
});

// 检查账户状态
async function checkAccountStatus() {
  try {
    const response = await api.get(`/account/getAccountStatus/${cardNo}`, {
      headers: { token },
    });

    if (response.data.code === 1) {
      if (response.data.data.includes('frozen')) {
        isAccountFrozen.value = true;
        ElMessage.error('您的银行卡已被冻结，无法使用取款功能');
      } else {
        isAccountFrozen.value = false;
      }
    }
  } catch (error) {
    console.error('检查账户状态失败:', error);
    ElMessage.error('检查账户状态失败，请稍后重试');
  }
}

function backToMenu() {
  router.push('/atm/mainatm/mainmenu');
  userStore.setCurrentPage('/atm/mainatm/mainmenu');
}

// 添加金额
function addAmount(key: string) {
  if (!isAccountFrozen.value && amount.value.length < 6) {
    const newAmount = amount.value + key;
    const num = parseInt(newAmount, 10);
    
    // 验证新金额是否超过1万
    if (num > 10000) {
      ElMessage.warning('单次取款金额不能超过1万元');
      return;
    }
    
    // 只有当输入是数字时才更新金额
    if (/^\d+$/.test(newAmount)) {
      amount.value = newAmount;
    }
  }
}

function clearAmount() {
  amount.value = '';
  error.value = false;
}

async function confirmWithdrawal() {
  if (isAccountFrozen.value) {
    ElMessage.error('您的账户已被冻结，无法进行取款操作');
    return;
  }

  const withdrawalAmount = parseInt(amount.value, 10);

  // 验证取款金额
  if (withdrawalAmount > 10000) {
    ElMessage.error('单次取款金额不能超过1万元');
    return;
  }

  if (withdrawalAmount % 100 !== 0) {
    ElMessage.error('暂无零钞，请输入100的倍数金额');
    return;
  }

  try {
    const response = await api.put(
      '/account/drawMoney',
      {
        cardNo,
        money: withdrawalAmount,
      },
      {
        headers: { token },
      }
    );

    if (response.data.code === 1) {
      userStore.deductBalance(withdrawalAmount);
      ElMessage.success('请取走您的钞票……');

      router.push({
        name: 'TransactionReceipt',
        params: { type: 'withdrawal', amount: withdrawalAmount.toString() },
      });
      userStore.setCurrentPage('/atm/mainatm/transactionreceipt');
    } else {
      ElMessage.error(response.data.msg || '取款失败，请稍后重试');
      error.value = true;
    }
  } catch (err: any) {
    console.error('取款失败:', err);
    error.value = true;
    ElMessage.error('取款失败，请稍后重试');
  }
}

const balance = ref('');

async function fetchBalance() {
  try {
    const response = await api.get(`/account/getBalance/${cardNo}`, {
      headers: { token },
    });

    if (response.data.code === 1 && response.data.data) {
      balance.value = response.data.data.replace('账户余额为：', '');
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

onMounted(() => {
  checkAccountStatus();
  fetchBalance();
});
</script>
<style scoped>
.withdrawal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>