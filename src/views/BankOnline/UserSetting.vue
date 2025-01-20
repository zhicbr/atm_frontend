<template>
  <div class="usersetting-container">
    <div class="user-list">
      <h2>用户管理</h2>

      <!-- Search Section -->
      <div class="search-section">
        <input v-model="searchParams.identification" placeholder="请输入身份证号" />
        <input v-model="searchParams.userName" placeholder="请输入用户名称" />
        <button @click="handleSearch">搜索</button>
      </div>

      <!-- Table displaying user info -->
      <table class="user-table">
        <thead>
          <tr>
            <th>用户ID</th>
            <th>身份证号</th>
            <th>用户名称</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.userId">
            <td>{{ user.userId }}</td>
            <td>{{ user.identification }}</td>
            <td>{{ user.userName }}</td>
            <td>{{ formatTime(user.creatTime) }}</td>
            <td>{{ user.updateTime ? formatTime(user.updateTime) : '未更新' }}</td>
            <td>
              <button @click="openUpdateUserModal(user)">修改</button>
              <button @click="confirmDeleteUser(user.identification)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }}/{{ totalPages }} 页</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage * pageSize >= totalUsers">下一页</button>
      </div>

      <!-- Add User Button -->
      <button @click="openAddUserModal">新增用户</button>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="modal">
      <div class="modal-content">
        <h3>新增用户</h3>
        <input v-model="newUser.identification" placeholder="请输入身份证号" />
        <input v-model="newUser.userName" placeholder="请输入用户名称" />
        <input 
          v-model="newUser.userPassword" 
          type="password" 
          placeholder="请输入用户密码（至少6位）" 
        />
        <button @click="addUser">确定</button>
        <button @click="showAddUserModal = false">取消</button>
      </div>
    </div>

    <!-- Update User Modal -->
    <div v-if="showUpdateUserModal" class="modal">
      <div class="modal-content">
        <h3>修改用户信息</h3>
        <input v-model="updatedUser.userName" placeholder="用户名称" />
        <input 
          v-model="updatedUser.userPassword" 
          type="password" 
          placeholder="请输入新密码（至少6位）" 
        />
        <button @click="updateUser">更新</button>
        <button @click="showUpdateUserModal = false">取消</button>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import axios from 'axios'
import api from '@/api/api';
import { useBankOnlineStore } from '@/stores/bankonline'
import { ElMessage, ElMessageBox } from 'element-plus'

interface User {
  userId: number
  identification: string
  userName: string
  userPassword: string
  creatTime: number[]
  updateTime: number[] | null
}

interface NewUser {
  identification: string
  userName: string
  userPassword: string
}

interface UpdatedUser {
  userId: number
  userName: string
  userPassword: string
}

interface SearchParams {
  identification: string
  userName: string
}

const currentPage = ref(1)
const pageSize = ref(7)
const totalUsers = ref(0)
const users = ref<User[]>([])
const showAddUserModal = ref(false)
const showUpdateUserModal = ref(false)
const userOnlineStore = useBankOnlineStore()
const token = userOnlineStore.token
const totalPages = ref(0)
const searchParams = ref<SearchParams>({
  identification: '',
  userName: ''
})

const newUser = ref<NewUser>({
  identification: '',
  userName: '',
  userPassword: ''
})

const updatedUser = ref<UpdatedUser>({
  userId: 0,
  userName: '',
  userPassword: ''
})

// Fetch user data
const fetchUserList = async () => {
  try {
    const response = await api.get('/user/page', {
      headers: { token },
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        identification: searchParams.value.identification,
        userName: searchParams.value.userName
      },
    })

    if (response.data.code === 1) {
      users.value = response.data.data.records
      totalUsers.value = response.data.data.total
      totalPages.value = Math.ceil(totalUsers.value / pageSize.value)
    }
  } catch (error) {
    console.error('Failed to fetch user list:', error)
  }
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 添加密码验证函数
const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// 修改 addUser 函数
const addUser = async () => {
  if (!newUser.value.identification || !newUser.value.userName || !newUser.value.userPassword) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  // 添加密码长度验证
  if (!validatePassword(newUser.value.userPassword)) {
    ElMessage.warning('密码长度必须大于6位');
    return;
  }

  try {
    const response = await api.post('/user/addUser', newUser.value, {
      headers: { token },
    });

    if (response.data.code === 1) {
      ElMessage.success('用户添加成功');
      showAddUserModal.value = false;
      fetchUserList();
      newUser.value = {
        identification: '',
        userName: '',
        userPassword: ''
      };
    } else {
      ElMessage.error('添加失败');
    }
  } catch (error) {
    console.error('Failed to add user:', error);
  }
};

// Handle updating a user
const openUpdateUserModal = (user: User) => {
  updatedUser.value.userId = user.userId
  updatedUser.value.userName = user.userName
  updatedUser.value.userPassword = ''
  showUpdateUserModal.value = true
}
const updateUser = async () => {
  if (!updatedUser.value.userName || !updatedUser.value.userPassword) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  // 添加密码长度验证
  if (!validatePassword(updatedUser.value.userPassword)) {
    ElMessage.warning('密码长度必须大于6位');
    return;
  }

  try {
    const response = await api.put('/user/updateUser', updatedUser.value, {
      headers: { token },
    });

    if (response.data.code === 1) {
      ElMessage.success('用户信息更新成功');
      showUpdateUserModal.value = false;
      fetchUserList();
    } else {
      ElMessage.error('更新失败');
    }
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};
// Handle confirming deletion
const confirmDeleteUser = (identification: string) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteUser(identification)
    })
    .catch(() => {
      // User clicked cancel
    })
}

// Handle deleting a user
const deleteUser = async (identification: string) => {
  try {
    const response = await api.delete(`/user/deleteUserAndAccounts/${identification}`, {
      headers: { token },
    })

    if (response.data.code === 1) {
      ElMessage.success('用户删除成功')
      fetchUserList()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

// Format time
const formatTime = (timeArray: number[]) => {
  return `${timeArray[0]}-${timeArray[1]}-${timeArray[2]} ${timeArray[3]}:${timeArray[4]}:${timeArray[5]}`
}

// Handle page navigation
const goToPage = (page: number) => {
  const maxPage = Math.ceil(totalUsers.value / pageSize.value)

  if (page < 1) {
    currentPage.value = 1
  } else if (page > maxPage) {
    currentPage.value = maxPage
  } else {
    currentPage.value = page
  }

  fetchUserList()
}

// Open Add User Modal
const openAddUserModal = () => {
  showAddUserModal.value = true
}

// Initial fetch when component is mounted
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.usersetting-container {
  padding-left: 50px;     
  padding-right: 30px;
  padding-top: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-section input {
  margin-right: 10px;
  width: 200px;
}

.user-list {
  margin-bottom: 30px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 10px;
  border: 1px solid #ddd;
}

.user-table th {
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