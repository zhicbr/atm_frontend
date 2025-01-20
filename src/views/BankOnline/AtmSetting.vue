<template>
  <div class="atmsetting-container">
    <!-- ATM List Section -->
    <div class="atm-list">
      <h2>ATM 机管理</h2>

      <!-- Search Section -->
      <div class="search-section">
        <input v-model="searchParams.location" placeholder="请输入 ATM 位置" />
        <select v-model="searchParams.status">
          <option value="">选择状态</option>
          <option value="online">在线</option>
          <option value="offline">离线</option>
        </select>
        <button @click="handleSearch">搜索</button>
      </div>

      <!-- ATM Table -->
      <table class="atm-table">
        <thead>
          <tr>
            <th>ATM ID</th>
            <th>位置</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="atm in atms" :key="atm.atmId">
            <td>{{ atm.atmId }}</td>
            <td>{{ atm.location }}</td>
            <td>{{ atm.atmStatus }}</td>
            <td>
              <button @click="openUpdateAtmModal(atm)">修改</button>
              <button @click="confirmDeleteAtm(atm.atmId)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Section -->
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage * pageSize >= totalAtms">下一页</button>
      </div>

      <!-- Add ATM Button -->
      <button class ="add-atm-btn" @click="openAddAtmModal">新增 ATM</button>
    </div>

    <!-- Add ATM Modal -->
    <div v-if="showAddAtmModal" class="modal">
      <div class="modal-content">
        <h3>新增 ATM</h3>
        <input v-model="newAtmLocation" placeholder="请输入 ATM 位置" />
        <button @click="addAtm">确定</button>
        <button @click="showAddAtmModal = false">取消</button>
      </div>
    </div>

    <!-- Update ATM Modal -->
    <div v-if="showUpdateAtmModal" class="modal">
      <div class="modal-content">
        <h3>修改 ATM 信息</h3>
        <input v-model="updatedAtmLocation" placeholder="ATM 位置" />
        <select v-model="updatedAtmStatus">
          <option value="">选择状态</option>
          <option value="online">在线</option>
          <option value="offline">离线</option>
        </select>
        <button @click="updateAtm">更新</button>
        <button @click="showUpdateAtmModal = false">取消</button>
      </div>
    </div>
  </div>
</template>


  
<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import axios from 'axios';
import api from '@/api/api';

import { useBankOnlineStore } from '@/stores/bankonline';
import { ElMessage, ElMessageBox } from 'element-plus'; // 引入 Element Plus 的组件

// 定义 ATM 类型
interface Atm {
  atmId: number;
  location: string;
  atmStatus: string;
}

// 响应状态
const codeSuccess = 1;

const atms = ref<Atm[]>([]);
const totalAtms = ref(0);
const totalPages = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);
const searchParams = ref({
  location: '',
  status: ''
});

const showAddAtmModal = ref(false);
const newAtmLocation = ref('');
const showUpdateAtmModal = ref(false);
const updatedAtmId = ref<number | null>(null);
const updatedAtmLocation = ref('');
const updatedAtmStatus = ref('');
const userOnlineStore = useBankOnlineStore();
const token = userOnlineStore.token;

// 获取 ATM 列表
const fetchAtmList = async () => {
  try {
    const response = await api.get('/atm/getAtm', {
      headers: { token },
      params: {
        location: searchParams.value.location || null,  // 如果 location 是空字符串，传递 null
        status: searchParams.value.status || null,      // 如果 status 是空字符串，传递 null
        page: currentPage.value,
        pageSize: pageSize.value,
      }
    });
    if (response.data.code === codeSuccess) {
      atms.value = response.data.data.records;
      totalAtms.value = response.data.data.total;
      totalPages.value = Math.ceil(totalAtms.value / pageSize.value);
    } else {
      ElMessage.error('获取 ATM 列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch ATM list:', error);
    ElMessage.error('获取 ATM 列表失败');
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 搜索时从第一页开始
  fetchAtmList();
};

// 分页处理
const goToPage = (page: number) => {
  const maxPage = Math.ceil(totalAtms.value / pageSize.value);

  if (page < 1) {
    currentPage.value = 1;
  } else if (page > maxPage) {
    currentPage.value = maxPage;
  } else {
    currentPage.value = page;
  }

  fetchAtmList();
};

// 打开新增 ATM 弹框
const openAddAtmModal = () => {
  showAddAtmModal.value = true;
};

// 新增 ATM
const addAtm = async () => {
  if (!newAtmLocation.value) {
    ElMessage.warning('请输入 ATM 位置');
    return;
  }

  try {
    const response = await api.post('/atm/addAtm', { location: newAtmLocation.value }, { headers: { token } });

    if (response.data.code === codeSuccess) {
      ElMessage.success('ATM 添加成功');
      showAddAtmModal.value = false;
      newAtmLocation.value = '';
      fetchAtmList(); // 刷新 ATM 列表
    } else {
      ElMessage.error('添加 ATM 失败');
    }
  } catch (error) {
    console.error('Failed to add ATM:', error);
    ElMessage.error('添加 ATM 失败');
  }
};

// 打开修改 ATM 弹框
const openUpdateAtmModal = (atm: Atm) => {
  updatedAtmId.value = atm.atmId;
  updatedAtmLocation.value = atm.location;
  updatedAtmStatus.value = atm.atmStatus;
  showUpdateAtmModal.value = true;
};

// 更新 ATM
const updateAtm = async () => {
  if (!updatedAtmId.value) return;

  try {
    const response = await api.put('/atm/updateAtm', {
      atmId: updatedAtmId.value,
      atmStatus: updatedAtmStatus.value || undefined,
      location: updatedAtmLocation.value || undefined,
    }, { headers: { token } });

    if (response.data.code === codeSuccess) {
      ElMessage.success('ATM 信息更新成功');
      showUpdateAtmModal.value = false;
      updatedAtmLocation.value = '';
      updatedAtmStatus.value = '';
      fetchAtmList(); // 刷新 ATM 列表
    } else {
      ElMessage.error('更新 ATM 失败');
    }
  } catch (error) {
    console.error('Failed to update ATM:', error);
  }
};

// 确认删除 ATM
const confirmDeleteAtm = (atmId: number) => {
  ElMessageBox.confirm('确定要删除该 ATM 吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteAtm(atmId);
  }).catch(() => { /* 用户点击取消，不做任何操作 */ });
};

// 删除 ATM
const deleteAtm = async (atmId: number) => {
  try {
    const response = await api.post(`/atm/deleteAtm/${atmId}`, {}, { headers: { token } });

    if (response.data.code === codeSuccess) {
      ElMessage.success('ATM 删除成功');
      fetchAtmList(); // 刷新 ATM 列表
    } else {
      ElMessage.error('删除 ATM 失败');
    }
  } catch (error) {
    console.error('Failed to delete ATM:', error);
  }
};

// 初始化时获取 ATM 列表
onMounted(() => {
  fetchAtmList();

});
</script>

  
  <style scoped>

  .pagination {
    margin-top: 20px;
    text-align: center;
  }

  .pagination button {
    padding: 5px 10px;
    margin: 0 5px;
    cursor: pointer;
  }
  .pagination button:disabled {
    background-color: #f1f1f1;
  }
  .add-atm-btn {
    margin-top: 20px;
  }
  .search-section{
    margin-bottom: 20px;
  }
  .search-section input {
  margin-right: 10px;
  width: 200px;
}
.search-section select {
  margin-right: 10px;
  width: 200px;
}


  .atmsetting-container {
    padding-left: 50px; 
    padding-right: 30px;
    padding-top: 20px;
  }
  
  .atm-list {
    margin-bottom: 30px;
  }
  
  .atm-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .atm-table th,
  .atm-table td {
    padding: 10px;
    border: 1px solid #ddd;
  }
  
  .atm-table th {
    background-color: #f4f4f4;
  }
  
  button {
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
  }
  
  input, select {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>
  