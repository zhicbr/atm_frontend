<template>
  <div class="atm-container">
    <header class="atm-header">
      <h1> 矿大银行 ATM</h1>
    </header>
    <main class="atm-content">
      <router-view />
    </main>
    <footer class="atm-footer">
      <p>&copy; 2024  Bank. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
// ATM related logic can be added here
</script>

<style scoped>
.atm-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Arial', sans-serif;
}

.atm-header {
  background-color: #e6f7ff; /* 浅蓝色背景 */
  color: rgb(48, 190, 211);
  padding: 2.2rem;
  text-align: center;
  
}

.atm-header h1 {
  margin: 0;
  font-size: 2rem;
  margin-left: -350px;
}

.atm-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0rem;

}

.atm-footer {
  background-color: #e6f7ff; /* 浅蓝色背景 */
  color: rgb(49, 41, 41);
  text-align: center;
  padding: 0.5rem;
  font-size: 0.8rem;
}
</style>