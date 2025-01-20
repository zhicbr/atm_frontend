<!--src/components/Sidebar.vue-->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBankOnlineStore } from '@/stores/bankonline'; // 使用 Pinia 管理状态
import { useRouter } from 'vue-router';

const isCollapsed = ref(false); // 折叠状态
const userOnlineStore = useBankOnlineStore(); // 用户状态管理
const isLoggedIn = ref(userOnlineStore.isLoggedIn); // 监听登录状态，使用 ref 包装

const router = useRouter();

// 菜单项配置
const menuItems = [
  {
    name: 'Dashboard',
    icon: '📊',
    path: '/bankonline/mainbankonline/dashboard',
  },
  {
    name: '账户管理',
    icon: '👤',
    children: [
      { name: '账户设置', path: '/bankonline/mainbankonline/myaccount' },
      { name: '交易记录', path: '/bankonline/mainbankonline/accounttransferrecord' }
    ],
  },

  {
    name:'管理员',
    icon: '👮‍♂️',
    children: [
      { name: '管理员设置', path: '/bankonline/mainbankonline/adminsetting' }
    ]
  } ,
  {
    name:'用户',
    icon: '👤',
    children: [
      { name: '用户设置', path: '/bankonline/mainbankonline/usersetting' }
    ]
  } ,
  {
    name:'ATM机',
    icon: '💳',
    children: [
      { name: 'ATM机设置', path: '/bankonline/mainbankonline/atmsetting' }
    ]
  } ,

  {
    name: '客服管理',
    icon: '💬',
    path: '', // 路径将在点击时动态决定
    handler: () => {
      // 根据管理员状态决定跳转路径
      const chatPath = userOnlineStore.IsAdmin 
        ? '/bankonline/mainbankonline/adminchat'
        : '/bankonline/mainbankonline/userchat';
      navigateTo(chatPath);
    }
  }
  
];


// 更新当前页面并导航
function navigateTo(path: string, handler: (() => void) | null = null) {
  if (handler) {
    handler();
  } else if (path) {
    userOnlineStore.setCurrentPage(path);
    router.push(path);
  }
}


// 折叠功能
function toggleSidebar() {
  if (userOnlineStore.IsAdmin) {
    isCollapsed.value = !isCollapsed.value;
  } else {
    // 可选：给非管理员显示提示
    console.log('只有管理员可以操作折叠按钮');
  }
}

// 登出功能
function logout() {
  userOnlineStore.setToken(''); // 清除登录状态
//   userOnlineStore.setUser(null);
  router.push('/bankonline/login'); // 跳转到登录页面

}

// 动态监听登录状态
watch(
  () => userOnlineStore.isLoggedIn, // 监听 Pinia 的登录状态
  (newVal) => {
    isLoggedIn.value = newVal; // 同步到本地 ref
    if (!newVal) {
      router.push('/bankonline/login'); // 如果未登录，跳转到登录页面
    }
  }
);

// 动态监听折叠状态（可选，控制台打印变化）
watch(
  isCollapsed,
  (newVal) => {
    console.log('Sidebar 折叠状态变化:', newVal ? '折叠' : '展开');
  }
);
</script>

<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]" v-if="isLoggedIn">
    <!-- 修改折叠按钮样式，根据权限显示不同状态 -->
    <button 
      class="toggle-btn" 
      @click="toggleSidebar"
      :class="{ 'disabled': !userOnlineStore.IsAdmin }"
      :title="!userOnlineStore.IsAdmin ? '需要管理员权限' : ''"
    >
      {{ isCollapsed ? '→' : '←' }}
    </button>
    <!-- 菜单 -->
    <nav class="sidebar-nav">
      <!-- 一级菜单项 -->
      <div
        v-for="item in menuItems"
        :key="item.name"
        class="menu-item"
      >
        <div 
          class="menu-header" 
          @click="item.children 
          ? '' 
          : item.handler 
            ? item.handler() 
            : navigateTo(item.path)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span v-if="!isCollapsed" class="text">{{ item.name }}</span>
        </div>
        <!-- 二级菜单 -->
        <div v-if="item.children && !isCollapsed" class="submenu">
          <router-link
            v-for="child in item.children"
            :key="child.path"
            :to="child.path"
            class="submenu-link"
            @click.prevent="navigateTo(child.path)" 
          >
            {{ child.name }}
          </router-link>
        </div>
      </div>
    </nav>
    <!-- 登出按钮 -->
    <button v-if="!isCollapsed" class="logout-btn" @click="logout">
      退出登录
    </button>
  </aside>
</template>

<style scoped>
/* 侧边栏整体样式 */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: #e6f7ff; /* 浅蓝色背景 */
  border-right: 1px solid #dcdcdc;
  width: 180px; /* 修改为指定宽度 */
  transition: all 0.3s ease;
  padding: 1rem;
  z-index: 100;
}

.sidebar.collapsed {
  width: 60px;
}
.toggle-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 折叠按钮 */
.toggle-btn {
  position: absolute;
  right: -12px;
  top: 20px;
  background: #007bff;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  z-index: 101;
}

/* 菜单容器 */
.sidebar-nav {
  margin-top: 2rem;
}

.menu-item {
  margin-bottom: 1rem;
}

.menu-header {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: #007bff; /* 深蓝色文字 */
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-header:hover {
  background-color: rgba(0, 123, 255, 0.1); /* 浅蓝色悬停效果 */
  border-radius: 6px;
}

/* 二级菜单 */
.submenu {
  padding-left: 1.5rem;
}

.submenu-link {
  display: block;
  color: #0056b3; /* 浅蓝色文字 */
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
}

.submenu-link:hover {
  color: #007bff; /* 鼠标悬停蓝色 */
}

.icon {
  margin-right: 1rem;
}

.collapsed .text {
  display: none;
}

.collapsed .icon {
  margin-right: 0;
}

/* 登出按钮 */
.logout-btn {
  position: absolute;
  bottom: 110px;
  left: 40px;
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #d32f2f;
}
</style>
