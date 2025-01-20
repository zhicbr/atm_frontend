<template>
    <div class="app-container">
      <h2 class="title">收付款</h2>
      <div class="content">
        <!-- 收款部分 -->
        <div class="section">
          <el-input
            v-model="shoukuanAmount"
            placeholder="请输入收款金额"
            class="input-amount"
            size="large"
            type="number"
          />
          <el-button
            type="primary"
            size="large"
            @click="getShoukuanQRCode"
            :loading="loadingShoukuan"
          >
            收款
          </el-button>
        </div>
  
        <!-- 付款部分 -->
        <div class="section">
          <el-button
            type="success"
            size="large"
            @click="getFukuanQRCode"
            :loading="loadingFukuan"
          >
            付款
          </el-button>
        </div>
  
        <!-- 二维码展示 -->
        <div v-if="qrCodeBase64" class="qr-code-container">
          <h3>QRcode</h3>
          <img
            :src="'data:image/png;base64,' + qrCodeBase64"
            alt="QR Code"
            class="qr-code-image"
          />
          <p>二维码链接：<a :href="qrUrl" target="_blank">{{ qrUrl }}</a></p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // import axios from "axios";
  import api from '@/api/api';

  
  export default {
    data() {
      return {
        shoukuanAmount: "", // 收款金额
        qrCodeBase64: "", // 二维码的 base64 数据
        qrUrl: "", // 二维码链接
        loadingShoukuan: false, // 收款按钮加载状态
        loadingFukuan: false, // 付款按钮加载状态
      };
    },
    methods: {
      // 获取收款二维码
      async getShoukuanQRCode() {
        if (!this.shoukuanAmount || isNaN(this.shoukuanAmount) || Number(this.shoukuanAmount) <= 0) {
        this.$message.error("请输入有效的收款金额！");
        return;
      }
  
        this.loadingShoukuan = true;
        try {
          const response = await api.get(`/YinLianPay/shoukuan`, {
            params: { total: this.shoukuanAmount },
          });
          this.qrCodeBase64 = response.data.qr_code_base64;
          this.qrUrl = response.data.qr_url;
          this.$message.success("收款二维码生成成功！");
        } catch (error) {
          this.$message.error("生成收款二维码失败，请稍后再试！");
          console.error(error);
        } finally {
          this.loadingShoukuan = false;
        }
      },
  
      // 获取付款二维码
      async getFukuanQRCode() {
        this.loadingFukuan = true;
        try {
          const response = await api.get(`/YinLianPay/fukuan`);
          this.qrCodeBase64 = response.data.qr_code_base64;
          this.qrUrl = response.data.qr_url;
          this.$message.success("付款二维码生成成功！");
        } catch (error) {
          this.$message.error("生成付款二维码失败，请稍后再试！");
          console.error(error);
        } finally {
          this.loadingFukuan = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .app-container {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    background-color: #f6f9fc;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .title {
    color: #2c3e50;
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
  }
  
  .input-amount {
    max-width: 200px;
  }
  
  .qr-code-container {
    margin-top: 30px;
    text-align: center;
  }
  
  .qr-code-image {
    margin-top: 10px;
    width: 200px;
    height: 200px;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
  }
  
  .qr-code-container a {
    color: #409eff;
    text-decoration: none;
  }
  
  .qr-code-container a:hover {
    text-decoration: underline;
  }
  </style>
  