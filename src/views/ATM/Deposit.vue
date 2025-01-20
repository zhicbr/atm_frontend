<template>
  <div class="deposit">
    <DisplayScreen 
      title="存款金额" 
      :message="message"
      :sub-message="subMessage"
    />
    <NumericKeypad @input="addAmount" @clear="clearAmount" :disabled="isAccountFrozen" />

    <div style="display: flex; align-items: center; gap: 10px;">
      <el-button
        type="success"
        @click="confirmDeposit"
        :disabled="!isValidAmount || isAccountFrozen"
        size="large"
        style="margin-top: 20px;"
      >
        确认存款
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
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useATMStore } from '@/stores/atm';
import DisplayScreen from '@/components/DisplayScreen.vue';
import NumericKeypad from '@/components/NumericKeypad.vue';
import { ElButton, ElMessage } from 'element-plus';
import api from '@/api/api';

const router = useRouter();
const userStore = useATMStore();
const amount = ref<string>('');
const isAccountFrozen = ref(false);

const message = computed(() => {
  if (isAccountFrozen.value) {
    return '您的账户已被冻结，无法使用存款功能';
  }
  return amount.value || '请输入存款金额';
});

// 添加辅助提示信息
const subMessage = computed(() => {
  if (amount.value) {
    const num = parseInt(amount.value, 10);
    if (num > 100000) {
      return '单次存款金额不能超过10万元';
    }
    if (num % 100 !== 0) {
      return '仅支持100元面值纸币';
    }
  }
  return '单次存款限额10万元，仅支持100元面值纸币';
});

const cardNo = userStore.selectedCard.cardNumber;
const token = userStore.token;

// 修改存款金额验证
const isValidAmount = computed(() => {
  const num = parseInt(amount.value, 10);
  return (
    !isNaN(num) && 
    num > 0 && 
    num <= 100000 && // 限制10万
    num % 100 === 0  // 必须是100的倍数
  );
});

async function checkAccountStatus() {
  try {
    const response = await api.get(`/account/getAccountStatus/${cardNo}`, {
      headers: { token },
    });

    if (response.data.code === 1) {
      if (response.data.data.includes('frozen')) {
        isAccountFrozen.value = true;
        ElMessage.error('您的银行卡已被冻结，无法使用存款功能');
      } else {
        isAccountFrozen.value = false;
        ElMessage.success('请放入现金……');
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

// 修改添加金额逻辑
function addAmount(key: string) {
  if (!isAccountFrozen.value && amount.value.length < 6) {
    const newAmount = amount.value + key;
    const num = parseInt(newAmount, 10);
    
    // 验证新金额是否超过10万
    if (num > 100000) {
      ElMessage.warning('单次存款金额不能超过10万元');
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
}

// 修改确认存款逻辑
async function confirmDeposit() {
  if (isAccountFrozen.value) {
    ElMessage.error('您的账户已被冻结，无法进行存款操作');
    return;
  }

  const depositAmount = parseInt(amount.value, 10);

  // 验证存款金额
  if (depositAmount > 100000) {
    ElMessage.error('单次存款金额不能超过10万元');
    return;
  }

  if (depositAmount % 100 !== 0) {
    ElMessage.error('仅支持100元面值纸币');
    return;
  }

  try {
    const response = await api.put(
      '/account/saveMoney',
      {
        cardNo,
        money: depositAmount,
      },
      {
        headers: { token },
      }
    );

    if (response.data.code === 1) {
      userStore.addBalance(depositAmount);
      router.push({
        name: 'TransactionReceipt',
        params: { type: 'deposit', amount: depositAmount.toString() },
      });
      userStore.setCurrentPage('/atm/mainatm/transactionreceipt');
    } else {
      console.error('存款失败:', response.data.msg || '未知错误');
      ElMessage.error(response.data.msg || '存款失败，请稍后重试');
    }
  } catch (error) {
    console.error('存款请求失败:', error);
    ElMessage.error('存款失败，请稍后重试');
  }
}

const balance = ref('查询中...');

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
.deposit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
