<template>
  <div class="keypad-container">
    <el-grid :gutter="10" class="keypad-grid">
      <el-row class="keypad-row" type="flex" justify="center">
        <el-col :span="8" v-for="key in keys.slice(0, 3)" :key="key" class="keypad-col">
          <el-button type="primary" @click="handleKey(key)" class="keypad-button">
            {{ key }}
          </el-button>
        </el-col>
      </el-row>
      <el-row class="keypad-row" type="flex" justify="center">
        <el-col :span="8" v-for="key in keys.slice(3, 6)" :key="key" class="keypad-col">
          <el-button type="primary" @click="handleKey(key)" class="keypad-button">
            {{ key }}
          </el-button>
        </el-col>
      </el-row>
      <el-row class="keypad-row" type="flex" justify="center">
        <el-col :span="8" v-for="key in keys.slice(6, 9)" :key="key" class="keypad-col">
          <el-button type="primary" @click="handleKey(key)" class="keypad-button">
            {{ key }}
          </el-button>
        </el-col>
      </el-row>
      <el-row class="keypad-row" type="flex" justify="center">
        <el-col :span="8" class="keypad-col">
          <el-button type="primary" @click="handleKey(keys[9])" class="keypad-button">
            {{ keys[9] }}
          </el-button>
        </el-col>
        <el-col :span="8" class="keypad-col">
          <el-button type="danger" @click="handleClear" class="keypad-button">
            清除
          </el-button>
        </el-col>
      </el-row>
    </el-grid>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['input', 'clear']);
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

function handleKey(key: string) {
  emit('input', key);
}

function handleClear() {
  emit('clear');
}
</script>

<style scoped>
.keypad-container {
  border: 1px solid var(--el-border-color);
  border-radius: 15px;
  padding: 10px;
  background-color: var(--el-fill-color-light);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%; 
  max-width: 300px;
  margin: 0 auto;
}

.keypad-grid {
  width: 100%;
}

.keypad-row {
  margin-bottom: 15px;
}

.keypad-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

.keypad-button {
  width: 80px;
  height: 62px;
  border-radius: 25px;
  font-size: 20px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.keypad-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.keypad-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
