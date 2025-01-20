<template>
  <div class="adminsetting-container">
    <div class="admin-list">
      <h2>管理员设置</h2>
      <div class="search-section">
        <input v-model="searchParams.adminName" placeholder="请输入管理员名称" />
        <button @click="handleSearch">搜索</button>
      </div>

      <table class="admin-table">
        <thead>
          <tr>
            <th>管理员ID</th>
            <th>管理员名称</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.adminId">
            <td>{{ admin.adminId }}</td>
            <td>{{ admin.adminName }}</td>
            <td>{{ formatTime(admin.createTime) }}</td>
            <td>{{ admin.updateTime ? formatTime(admin.updateTime) : '未更新' }}</td>
            <td>
              <button @click="openUpdateAdminModal(admin)">修改</button>
              <button @click="confirmDeleteAdmin(admin.adminId)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }}/ {{ totalPages }} 页</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage * pageSize >= totalAdmins">下一页</button>
      </div>

      <button @click="openAddAdminModal">新增管理员</button>
    </div>

    <!-- Modals remain unchanged -->
    <div v-if="showAddAdminModal" class="modal">
      <div class="modal-content">
        <h3>新增管理员</h3>
        <input v-model="newAdminName" placeholder="请输入管理员姓名" />
        <input v-model="newAdminPassword" type="password" placeholder="请输入管理员密码" />
        <button @click="addAdmin">确定</button>
        <button @click="showAddAdminModal = false">取消</button>
      </div>
    </div>

    <div v-if="showUpdateAdminModal" class="modal">
      <div class="modal-content">
        <h3>修改管理员信息</h3>
        <input v-model="updatedAdminName" placeholder="管理员姓名" />
        <input v-model="updatedAdminPassword" type="password" placeholder="管理员密码" />
        <button @click="updateAdmin">更新</button>
        <button @click="showUpdateAdminModal = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import axios from 'axios';
import api from '@/api/api';

import { useBankOnlineStore } from '@/stores/bankonline';
import { ElMessage, ElMessageBox } from 'element-plus';

const currentPage = ref(1);
const pageSize = ref(5);
const totalAdmins = ref(0);
const admins = ref([]);
const showAddAdminModal = ref(false);
const newAdminName = ref('');
const newAdminPassword = ref('');
const showUpdateAdminModal = ref(false);
const updatedAdminName = ref('');
const updatedAdminPassword = ref('');
const adminToUpdate = ref(null);
const userOnlineStore = useBankOnlineStore();
const token = userOnlineStore.token;
const totalPages = ref(0);

const searchParams = ref({
  adminName: ''
});

const fetchAdminList = async () => {
  try {
    const response = await api.get('/admin/page', {
      headers: { token },
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        adminName: searchParams.value.adminName
      },
    });

    if (response.data.code === 1) {
      admins.value = response.data.data.records;
      totalAdmins.value = response.data.data.total;
      totalPages.value = Math.ceil(totalAdmins.value / pageSize.value);
    }
  } catch (error) {
    console.error('Failed to fetch admin list:', error);
    ElMessage.error('获取管理员列表失败');
  }
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page when searching
  fetchAdminList();
};

const goToPage = (page) => {
  const maxPage = Math.ceil(totalAdmins.value / pageSize.value);
  
  if (page < 1) {
    currentPage.value = 1;
  } else if (page > maxPage) {
    currentPage.value = maxPage;
  } else {
    currentPage.value = page;
  }
  
  fetchAdminList();
};

// Rest of the methods remain unchanged
const addAdmin = async () => {
  if (!newAdminName.value || !newAdminPassword.value) {
    ElMessage.warning('请输入管理员姓名和密码');
    return;
  }

  try {
    const response = await api.post('/admin/addAdmin', {
      adminName: newAdminName.value,
      adminPassword: newAdminPassword.value,
    }, {
      headers: { token },
    });

    if (response.data.code === 1) {
      ElMessage.success('管理员添加成功');
      showAddAdminModal.value = false;
      fetchAdminList();
    } else {
      ElMessage.error('添加失败');
    }
  } catch (error) {
    console.error('Failed to add admin:', error);
    ElMessage.error('添加管理员失败');
  }
};

const openUpdateAdminModal = (admin) => {
  updatedAdminName.value = admin.adminName;
  updatedAdminPassword.value = '';
  adminToUpdate.value = admin;
  showUpdateAdminModal.value = true;
};

const updateAdmin = async () => {
  if (!updatedAdminName.value || !updatedAdminPassword.value) {
    ElMessage.warning('请输入管理员姓名和密码');
    return;
  }

  try {
    const response = await api.put('/admin/updateAdmin', {
      adminId: adminToUpdate.value.adminId,
      adminName: updatedAdminName.value,
      adminPassword: updatedAdminPassword.value,
    }, {
      headers: { token },
    });

    if (response.data.code === 1) {
      ElMessage.success('管理员信息更新成功');
      showUpdateAdminModal.value = false;
      fetchAdminList();
    } else {
      ElMessage.error('更新失败');
    }
  } catch (error) {
    console.error('Failed to update admin:', error);
    ElMessage.error('更新管理员失败');
  }
};

const confirmDeleteAdmin = (adminId) => {
  ElMessageBox.confirm('确定要删除该管理员吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteAdmin(adminId);
    })
    .catch(() => {});
};

const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/admin/delete/${adminId}`, {
      headers: { token },
    });

    if (response.data.code === 1) {
      ElMessage.success('管理员删除成功');
      fetchAdminList();
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    console.error('Failed to delete admin:', error);
    ElMessage.error('删除管理员失败');
  }
};

const formatTime = (timeArray) => {
  return `${timeArray[0]}-${timeArray[1]}-${timeArray[2]} ${timeArray[3]}:${timeArray[4]}:${timeArray[5]}`;
};

const openAddAdminModal = () => {
  showAddAdminModal.value = true;
};

onMounted(() => {
  fetchAdminList();
});
</script>

<style scoped>

.search-section{
  margin-bottom: 20px;
}
.search-section input{
  width: 200px;
  margin-right: 10px;
}
/* Styles remain unchanged */
.adminsetting-container {
  padding-left: 50px;
  padding-right: 30px;
  padding-top: 20px;
}

.admin-list {
  margin-bottom: 30px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 10px;
  border: 1px solid #ddd;
}

.admin-table th {
  background-color: #f4f4f4;
}

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

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>