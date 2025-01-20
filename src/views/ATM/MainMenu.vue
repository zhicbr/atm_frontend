<template>
  <div class="main-menu">
    <DisplayScreen :title="'Welcome to ATM'"  />
    <div class="menu-grid">
      <button class="menu-item" @click="goToBalance">
        <WalletIcon class="menu-icon" />
        <span>查询余额</span>
      </button>
      <button class="menu-item" @click="goToWithdrawal">
        <ArrowDownCircleIcon class="menu-icon" />
        <span>取款</span>
      </button>
      <button class="menu-item" @click="goToDeposit">
        <ArrowUpCircleIcon class="menu-icon" />
        <span>存款</span>
      </button>
      <button class="menu-item" @click="goToTransfer">
        <ArrowRightCircleIcon class="menu-icon" />
        <span>转账</span>
      </button>
      <button class="menu-item" @click="goToTransactionRecord">
        <ListIcon class="menu-icon" />
        <span>交易记录</span>
      </button>
      <button class="menu-item exit" @click="exit">
        <LogOutIcon class="menu-icon" />
        <span>Exit</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import DisplayScreen from '@/components/DisplayScreen.vue';
import { useATMStore } from '@/stores/atm';
import { WalletIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, ArrowRightCircleIcon, ListIcon, LogOutIcon } from 'lucide-vue-next';

const router = useRouter();
const userStore = useATMStore();

function goToBalance() {
  router.push('/atm/mainatm/balance-inquiry');
  userStore.setCurrentPage('/atm/mainatm/balance-inquiry');
}

function goToWithdrawal() {
  router.push('/atm/mainatm/withdrawal');
  userStore.setCurrentPage('/atm/mainatm/withdrawal');
}

function goToDeposit() {
  router.push('/atm/mainatm/deposit');
  userStore.setCurrentPage('/atm/mainatm/deposit');
}

function goToTransfer() {
  router.push('/atm/mainatm/transfer');
  userStore.setCurrentPage('/atm/mainatm/transfer');
}

function goToTransactionRecord() {
  router.push('/atm/mainatm/transaction-record');
  userStore.setCurrentPage('/atm/mainatm/transaction-record');
}

function exit() {
  router.push('/atm/mainatm/exit');
  userStore.setCurrentPage('/atm/mainatm/exit');
  userStore.clearToken();
}
</script>

<style scoped>
.main-menu {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #5294c6;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background-color: #2980b9;
}

.menu-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
}

.menu-item.exit {
  background-color: #e74c3c;
}

.menu-item.exit:hover {
  background-color: #c0392b;
}
</style>