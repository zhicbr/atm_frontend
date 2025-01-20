<template>
    <el-container style="padding: 20px;">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>交易记录查询</span>
        </div>
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="ATM ID">
            <el-input v-model.number="searchForm.atmId" placeholder="请输入ATM ID"></el-input>
          </el-form-item>
          <el-form-item label="卡号">
            <el-input v-model="searchForm.cardNo1" placeholder="请输入卡号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="fetchTransactions">搜索</el-button>
            <el-button @click="resetSearchForm" icon="el-icon-refresh">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="transactions" stripe style="width: 100%">
          <el-table-column prop="tranId" label="交易ID"></el-table-column>
          <el-table-column prop="cardNo1" label="卡号"></el-table-column>
          <el-table-column prop="atmId" label="ATM ID"></el-table-column>
          <el-table-column prop="status" label="交易状态"></el-table-column>
          <el-table-column prop="money" label="金额"></el-table-column>
          <el-table-column prop="tranTime" label="交易时间" :formatter="formatDateTime"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="danger" size="small" @click="deleteTransaction(scope.row.tranId)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </el-card>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  // import axios from 'axios'
  import api from '@/api/api';

  import { ElMessage } from 'element-plus'
  
  const searchForm = ref({
    atmId: null,
    cardNo1: null
  })
  const transactions = ref([])
  const currentPage = ref(1)
  const pageSize = ref(6)
  const total = ref(0)
  
  const fetchTransactions = async () => {
    const params = {
      atmId: searchForm.value.atmId || 0,
      cardNo1: searchForm.value.cardNo1 || null,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    try {
      const { data } = await api.get('/transaction/page', { params })
      if (data.code === 1) {
        transactions.value = data.data.records
        total.value = data.data.total
      } else {
        ElMessage.error(data.msg || 'Failed to fetch data')
      }
    } catch (error) {
      ElMessage.error('Error loading data')
    }
  }
  
  const deleteTransaction = async (tranId) => {
    try {
      const response = await api.delete(`/transaction/deleteTransaction/${tranId}`)
      if (response.data.code === 1) {
        ElMessage.success('Transaction deleted successfully')
        fetchTransactions()
      } else {
        ElMessage.error(response.data.msg || 'Failed to delete transaction')
      }
    } catch (error) {
      ElMessage.error('Error deleting transaction')
    }
  }
  
  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    fetchTransactions()
  }
  
  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
    fetchTransactions()
  }
  
  const resetSearchForm = () => {
    searchForm.value = { atmId: null, cardNo1: null }
    fetchTransactions()
  }
  
  const formatDateTime = (row, column, cellValue, index) => {
    return cellValue ? `${cellValue[0]}-${cellValue[1].toString().padStart(2, '0')}-${cellValue[2].toString().padStart(2, '0')} ${cellValue[3].toString().padStart(2, '0')}:${cellValue[4].toString().padStart(2, '0')}:${cellValue[5].toString().padStart(2, '0')}` : '';
  }
  
  fetchTransactions()
  </script>
  
  
  <style scoped>
  .transaction-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .search-form {
    margin-bottom: 20px;
  }
  
  :deep(.el-button--primary) {
    background-color: #409eff;
    border-color: #409eff;
  }
  
  :deep(.el-button--primary:hover) {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
  </style>
  