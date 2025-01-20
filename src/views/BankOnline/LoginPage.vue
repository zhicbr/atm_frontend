<template>
  <div class="login-container">
    <div class="background-overlay"></div>
    <el-card class="login-card">
      <h1>管理员登录</h1>
      <el-form :model="formData" ref="loginForm" @submit.prevent="handleLogin">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入管理员名"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="formData.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" native-type="button" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useBankOnlineStore } from '@/stores/bankonline';
import { useCommonStore } from '@/stores/commen';
// import axios from 'axios';
import api from '@/api/api';


const userOnlineStore = useBankOnlineStore();
const router = useRouter();
const commonStore = useCommonStore();

// 登录模式切换：true为管理员，false为用户
const isAdmin = ref(true);

// 表单数据（通用）
const formData = reactive({
  name: '',
  password: ''
});

// 管理员登录逻辑
async function loginAdmin() {
  try {
    const resp = await api.post('/login/admin', {
      adminName: formData.name,
      adminPassword: formData.password
    });
    if (resp.data.code === 1) {
      const token = resp.data.data;
      userOnlineStore.setToken(token);
      userOnlineStore.setIsAdmin(true);
      const idResponse = await api.get('/admin/getIdbyName', {
        headers: { token },
        params: { name: formData.name }
      });
      if (idResponse.data.code === 1) {
        userOnlineStore.setID(idResponse.data.data);
        ElMessage.success('管理员登录成功');
        const adminInfo = { name: formData.name };
        userOnlineStore.setUserA(adminInfo);
        router.push({ name: 'Dashboard' });
      } else {
        ElMessage.warning('无法获取管理员 ID，请稍后重试。');
      }
    } else {
      ElMessage.error('管理员登录失败，请检查用户名和密码。');
    }
  } catch (error) {
    console.error('Failed to login admin:', error);
    ElMessage.error('管理员登录失败，请检查用户名和密码。');
  }
}

// 用户登录逻辑
async function loginUser() {
  try {
    const resp = await api.post('/login/user', {
      userName: formData.name,
      userPassword: formData.password
    });
    if (resp.data.code === 1) {
      const token = resp.data.data;
      userOnlineStore.setToken(token);
      userOnlineStore.setIsAdmin(false);
      const idResponse = await api.get(`/Useraccount/selectByName/${encodeURIComponent(formData.name)}`, {
        headers: { token }
      });
      if (idResponse.data.code === 1) {
        userOnlineStore.setID(idResponse.data.data);
        ElMessage.success('用户登录成功');
        const userInfo = { name: formData.name };
        userOnlineStore.setUserA(userInfo);
        router.push({ name: 'Dashboard' });
      } else {
        ElMessage.warning('无法获取用户 ID，请稍后重试。');
      }
    } else {
      ElMessage.error('用户登录失败，请检查用户名和密码。');
    }
  } catch (error) {
    console.error('Failed to login user:', error);
    ElMessage.error('用户登录失败，请检查用户名和密码。');
  }
}

// 根据当前模式调用相应的登录方法
function handleLogin() {
  if (isAdmin.value) {
    loginAdmin();
  } else {
    loginUser();
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(5px); /* 可选：添加模糊效果 */
  z-index: -1;
}

.login-card {
  width: 400px;
  background-color: rgba(255, 255, 255, 0.9); /* 半透明背景 */
  padding: 20px;
  border-radius: 8px;
}
</style>