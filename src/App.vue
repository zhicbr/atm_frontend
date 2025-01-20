<-- App.vue -->
<template>
  <div class="nav-container">
    <div class="nav-box">
      <!-- ATM 选择下拉框 -->
      <div class="select-wrapper">
        <select 
          v-model="selectedATM" 
          @change="handleATMChange" 
          :disabled="isSelectDisabled"
          class="custom-select"
        >
          <option disabled value="">请选择 ATM</option>
          <option v-for="atm in atmList" :key="atm.atmId" :value="atm">
            {{ 'atm' + atm.atmId }} {{ atm.location }}
          </option>
        </select>
      </div>
      <router-link
        class="nav-link"
        to="/atm"
        :class="{ disabled: isATMDisabled }"
        @click.prevent="isATMDisabled && $event.preventDefault()">ATM</router-link>
      <router-link
        class="nav-link"
        to="/bankonline"
        :class="{ disabled: isBankOnlineDisabled }"
        @click.prevent="isBankOnlineDisabled && $event.preventDefault()">manegement </router-link>
    </div>
  </div>
  <!-- 路由视图 -->
  <div class="content-container">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useATMStore } from '@/stores/atm';
import api from '@/api/api';

const userStore = useATMStore();
const route = useRoute(); // 使用 useRoute 获取当前路由

// 定义 ATM 对象的类型
interface ATM {
  atmId: number;
  location: string;
  atmStatus: string;
}

// 状态
const isATMDisabled = ref(false);
const isBankOnlineDisabled = ref(false);
const atmList = ref<ATM[]>([]);// 存储 ATM 列表，指定为 ATM 类型的数组
const selectedATM = ref<ATM | null>(null);// 存储选中的 ATM，指定为 ATM 类型或 null
const isSelectDisabled = ref(true); // 下拉框的禁用状态

// 根据当前路由动态设置禁用状态
const updateDisabledState = () => {
  const currentPath = route.path;
  isATMDisabled.value = currentPath.startsWith('/atm');
  isBankOnlineDisabled.value = currentPath.startsWith('/bankonline');
  isSelectDisabled.value = currentPath !== '/atm/welcome'; // 仅在 /atm/welcome 时启用下拉框

};

// 监听路由变化
watch(() => route.path, updateDisabledState);

// 获取 ATM 列表
const fetchATMList = async () => {
  try {
    const response = await api.get('/atm/getAtmList');
    if (response.data.code === 1) {
      // 过滤在线的 ATM
      atmList.value = response.data.data.filter(atm => atm.atmStatus === 'online') as ATM[];
      
      // 默认选择第一个 ATM
      if (atmList.value.length > 0) {
        selectedATM.value = atmList.value[0];
        userStore.setAtm({ id: selectedATM.value.atmId, location: selectedATM.value.location });
      }
    }
  } catch (error) {
    console.error('Error fetching ATM list:', error);
  }
};

// 处理下拉框选择变化
const handleATMChange = () => {
  if (selectedATM.value) {
    userStore.setAtm({ id: selectedATM.value.atmId, location: selectedATM.value.location });
    console.log('Selected ATM:', selectedATM.value);
  }
};

// 初始化组件
onMounted(() => {
  fetchATMList();
  updateDisabledState(); // 初始化时根据当前路由设置状态
});
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #e6f7ff; /* 浅蓝色背景 */
  color: #333; /* 深灰色字体 */
}

/* 导航容器 */
.nav-container {
  position: absolute;
  top: 0;
  right: 0;
  padding: 20px;
  z-index: 1000;
}

/* 导航链接盒子 */
.nav-box {
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: #f9f9f9; /* 浅灰色背景 */
  border: 1px solid #dcdcdc; /* 浅灰色边框 */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

/* 导航链接样式 */
.nav-link {
  text-decoration: none;
  color: #007bff; /* 浅蓝色文字 */
  font-size: 18px;
  font-weight: bold;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
  background-color: #007bff; /* 鼠标悬停背景颜色 */
  color: #fff; /* 鼠标悬停文字颜色 */
}

.disabled {
  pointer-events: none; /* 禁用链接的点击事件 */
  color: #d3d3d3; /* 使用灰色表现禁用状态 */
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: linear-gradient(to right, #f9f9f9, #fff); /* 渐变背景 */
  color: #333;
  appearance: none; /* 隐藏默认下拉箭头 */
  transition: border-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
}

.custom-select:focus {
  outline: none;
  border-color: #007bff; /* 聚焦时边框颜色 */
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2); /* 聚焦时阴影 */
}

.custom-select:disabled {
  background: #f5f5f5; /* 禁用背景 */
  color: #a9a9a9; /* 禁用文字颜色 */
  border-color: #dcdcdc; /* 禁用边框颜色 */
  cursor: not-allowed;
}

.custom-select option {
  padding: 10px;
  background: #fff; /* 下拉菜单背景色 */
  color: #333;
}

/* 下拉箭头 */
.select-wrapper::after {
  content: '▼'; /* 自定义箭头符号 */
  font-size: 14px;
  color: #333;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* 禁用箭头点击 */
}

.custom-select:disabled + ::after {
  color: #a9a9a9; /* 禁用状态的箭头颜色 */
}
</style>
