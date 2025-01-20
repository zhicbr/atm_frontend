<!-- src/views/ATM/PinEntry.vue -->
<template>
  <div class="pin-entry">
    <DisplayScreen title="请输入密码,并注意遮挡" :message="maskedPin" />
    <NumericKeypad @input="addPin" @clear="clearPin" />
    <el-alert
      v-if="error"
      title="PIN 错误，请重试"
      type="error"
      show-icon
      closable
      @close="error = false"
      style="margin-top: 20px;"
    />
    <el-button type="primary" @click="backToWelcome" size="large" style="margin-top: 20px; width: 180px;">
      退出
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useATMStore } from '@/stores/atm';
import { useCommonStore } from '@/stores/commen';
import DisplayScreen from '@/components/DisplayScreen.vue';
import NumericKeypad from '@/components/NumericKeypad.vue';
// import axios from 'axios';
import { ElMessage } from 'element-plus';
import api from '@/api/api';

const router = useRouter();
const userStore = useATMStore();
const commonStore = useCommonStore();
const error = ref<boolean>(false);
const PIN_LENGTH = 6;
const accountPassword = ref('');
const cardNum = userStore.selectedCard.cardNumber;
// 定时器引用
const alertTimer = ref<number | null>(null);

// 计算输入的密码的掩码
const maskedPin = computed(() => '*'.repeat(accountPassword.value.length));

// 添加密码数字
function addPin(key: string) {
  if (accountPassword.value.length < PIN_LENGTH) {
    accountPassword.value += key;
    if (accountPassword.value.length === PIN_LENGTH) {
      login();
    }
  }
}

// 清除密码
function clearPin() {
  accountPassword.value = '';
  error.value = false;
}

// 返回欢迎界面
function backToWelcome() {
  router.push('/atm/welcome');
  userStore.setCurrentPage('/atm/welcome');
}

// 登录函数
async function login() {
  try {
    const response = await api.post('/login/atm', {
      accountPassword: accountPassword.value,
      atmId: userStore.atm.id,
      cardNo: cardNum,
    });

    if (response.data.code === 1) {
      const token = response.data.data;
      userStore.setToken(token);
      router.push('/atm/mainatm/mainmenu');
      userStore.setCurrentPage('/atm/mainatm/mainmenu');
      commonStore.setState(1);
    } else {
      ElMessage.error('登录失败，请检查密码');
      clearPin();
      setErrorAndStartTimer();
    }
  } catch (error) {
    console.error('请求错误:', error);
    ElMessage.error('登录失败，请稍后重试');
  }
}

// 检查账户状态
async function checkAccountStatus() {
  try {
    const response = await api.get(`/account/getAccountStatus/${cardNum}`, {
      headers: { token: userStore.token },
    });

    if (response.data.code === 1 && response.data.data.includes('frozen')) {
      ElMessage.error('您的账户已被冻结，无法使用 ATM 机');
      router.push('/atm/welcome'); // 跳转回欢迎页面
      userStore.setCurrentPage('/atm/welcome');
    }
  } catch (error) {
    console.error('检查账户状态失败:', error);
    ElMessage.error('检查账户状态失败，请稍后重试');
    router.push('/atm/welcome');
    userStore.setCurrentPage('/atm/welcome');
  }
}

// 设置错误并启动定时器
function setErrorAndStartTimer() {
  error.value = true;
  if (alertTimer.value !== null) clearTimeout(alertTimer.value); // 清除旧的定时器

  alertTimer.value = window.setTimeout(() => {
    handleCloseAlert();
  }, 3000) as unknown as number; // 明确转换为 number 类型
}

// 关闭提示
function handleCloseAlert() {
  error.value = false;
  if (alertTimer.value !== null) {
    window.clearTimeout(alertTimer.value); // 使用 window.clearTimeout 来确保清除的是浏览器环境的定时器
    alertTimer.value = null;
  }
}

// 页面加载时检查账户状态
onMounted(() => {
  checkAccountStatus();
});
</script>

<style scoped>
.pin-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.el-button {
  height: 50px;
  font-size: 16px;
}
</style>
