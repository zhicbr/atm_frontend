<template>
  <div class="transaction-record">
    <h2>交易记录</h2>
    
    <el-table :data="transactionList" stripe style="width: 100%">
      <el-table-column prop="tranId" label="交易ID" width="100" />
      <el-table-column prop="cardNo1" label="卡号1" width="180" />
      <el-table-column label="卡号2" width="180">
        <template #default="scope">
          <span v-if="scope.row.cardNo1 !== scope.row.cardNo2">
            {{ scope.row.cardNo2 }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="交易类型" width="120">
        <template #default="scope">
          <span :class="getStatusClass(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="money" label="金额" width="120" />
      <el-table-column prop="tranTime" label="交易时间">
        <template #default="scope">
          {{ formatTime(scope.row.tranTime) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-button :disabled="currentPage <= 1" @click="prevPage">上一页</el-button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <el-button :disabled="currentPage >= totalPages" @click="nextPage">下一页</el-button>
    </div>

    <div class="actions">
      <el-button type="primary" @click="backToMenu">返回主菜单</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useATMStore } from '@/stores/atm'
// import axios from 'axios'
import api from '@/api/api';

const router = useRouter()
const userStore = useATMStore()
const cardNo = userStore.selectedCard.cardNumber
const token = userStore.token

const transactionList = ref([])
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const totalPages = ref(0)

const getTransactions = async () => {
  try {
    const response = await api.get('/transaction/pageByCardNo', {
      params: {
        cardNo: cardNo,
        page: currentPage.value,
        pageSize: pageSize.value
      },
      headers: {
        token: token
      }
    })
    
    if (response.data.code === 1) {
      transactionList.value = response.data.data.records
      total.value = response.data.data.total
      totalPages.value = Math.ceil(total.value / pageSize.value)
    }
  } catch (error) {
    console.error('获取交易记录失败:', error)
  }
}

const getStatusText = (status) => {
  const statusMap = {
    'transfer': '转账',
    'withdraw': '取款',
    'save': '存款'
  }
  return statusMap[status] || status
}

// 获取状态对应的样式类
const getStatusClass = (status) => {
  return {
    'status-transfer': status === 'transfer',
    'status-withdraw': status === 'withdraw',
    'status-save': status === 'save'
  }
}

// 格式化时间
const formatTime = (timeArray) => {
  if (!Array.isArray(timeArray)) return ''
  const [year, month, day, hour, minute, second] = timeArray
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    getTransactions()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    getTransactions()
  }
}

const backToMenu = () => {
  router.push('/atm/mainatm/mainmenu')
  userStore.setCurrentPage('/atm/mainatm/mainmenu')
}

onMounted(() => {
  getTransactions()
})
</script>

<style scoped>
.transaction-record {
  padding: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.status-transfer {
  color: #F56C6C;  /* 红色 */
  font-weight: bold;
}

.status-withdraw {
  color: #409EFF; /* 蓝色 */
  font-weight: bold;
}

.status-save {
  color: #67C23A;  /* 绿色 */
  font-weight: bold;
}
</style>