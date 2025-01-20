<template>
  <div class="container">
    <h1>账户管理系统</h1>
    <div class="form-group">
      <h2>开户</h2>
      <div class="input-wrapper">
        <input 
          type="text" 
          v-model="newAccount.identification" 
          placeholder="身份证号" 
          maxlength="18"
          @input="validateIdentification"
        />
        <span class="error-message" v-if="identificationError">{{ identificationError }}</span>
      </div>
      <input 
        type="password" 
        v-model="newAccount.accountPassword" 
        placeholder="账户密码" 
      />
      <button @click="addAccount" :disabled="!!identificationError">开户</button>
    </div>

    <div class="form-group">
      <h2>删除账户</h2>
      <div class="input-wrapper">
        <input 
          type="text" 
          v-model="deleteCardno" 
          placeholder="卡号" 
          maxlength="16"
          @input="validateCardNo"
        />
        <span class="error-message" v-if="deleteCardError">
          {{ deleteCardError }}
        </span>
      </div>
      <button 
        @click="deleteAccount" 
        :disabled="!!deleteCardError || !deleteCardno"
      >
        删除
      </button>
    </div>

    <div class="form-group">
      <h2>查询用户卡号</h2>
      <div class="input-wrapper">
        <input 
          type="text" 
          v-model="queryIdentification" 
          placeholder="身份证号" 
          maxlength="18"
          @input="validateQueryIdentification"
        />
        <span class="error-message" v-if="queryIdentificationError">
          {{ queryIdentificationError }}
        </span>
      </div>
      <button 
        @click="getCardNO" 
        :disabled="!!queryIdentificationError || !queryIdentification"
      >
        查询
      </button>
      <ul>
        <li v-for="cardno in cardNOList" :key="cardno">{{ cardno }}</li>
      </ul>
    </div>

    <div class="form-group">
      <h2>冻结/解冻账户</h2>
      <input type="text" v-model="updateAccount.accountId" placeholder="账户ID" />
      <select v-model="updateAccount.accountStatus">
        <option value="frozen">冻结</option>
        <option value="active">解冻</option>
      </select>
      <button @click="updateAccountStatus">更新</button>
    </div>
  </div>
</template>
  
<script>
import api from '@/api/api';

export default {
  data() {
    return {
      newAccount: {
        identification: '',
        accountPassword: ''
      },
      identificationError: '',
      deleteCardno: '',
      deleteCardError: '',
      queryIdentification: '',
      queryIdentificationError: '',
      cardNOList: [],
      updateAccount: {
        accountId: '',
        accountStatus: 'frozen'
      }
    };
  },
  methods: {
    validateIdentification() {
      const idCard = this.newAccount.identification;
      
      // 移除非数字字符
      this.newAccount.identification = idCard.replace(/[^\d]/g, '');
      
      if (this.newAccount.identification.length === 0) {
        this.identificationError = '';
      } else if (this.newAccount.identification.length !== 18) {
        this.identificationError = '身份证号必须是18位';
      } else {
        this.identificationError = '';
      }
    },

    validateQueryIdentification() {
      const idCard = this.queryIdentification;
      
      // 移除非数字字符
      this.queryIdentification = idCard.replace(/[^\d]/g, '');
      
      if (this.queryIdentification.length === 0) {
        this.queryIdentificationError = '';
      } else if (this.queryIdentification.length !== 18) {
        this.queryIdentificationError = '身份证号必须是18位';
      } else {
        this.queryIdentificationError = '';
      }
    },

    validateCardNo() {
      // 移除非数字字符
      this.deleteCardno = this.deleteCardno.replace(/[^\d]/g, '');
      
      if (this.deleteCardno.length === 0) {
        this.deleteCardError = '';
      } else if (this.deleteCardno.length !== 16) {
        this.deleteCardError = '卡号必须是16位';
      } else {
        this.deleteCardError = '';
      }
    },
      
    async addAccount() {
      if (!this.newAccount.identification || this.newAccount.identification.length !== 18) {
        alert('请输入正确的18位身份证号');
        return;
      }

      if (!this.newAccount.accountPassword) {
        alert('请输入账户密码');
        return;
      }

      try {
        const response = await api.post('/account/addAccount', this.newAccount);
        if (response.data.code === 1) {
          alert('开户成功，卡号为：' + response.data.data);
          this.newAccount.identification = '';
          this.newAccount.accountPassword = '';
        } else {
          alert('开户失败');
        }
      } catch (error) {
        console.error(error);
        alert('开户失败');
      }
    },

    async deleteAccount() {
      if (!this.deleteCardno) {
        this.deleteCardError = '请输入卡号';
        return;
      }

      if (this.deleteCardno.length !== 16) {
        this.deleteCardError = '卡号必须是16位';
        return;
      }

      try {
        const response = await api.delete(`/account/deleteAccount/${this.deleteCardno}`);
        if (response.data.code === 1) {
          alert('删除成功');
          this.deleteCardno = '';
          this.deleteCardError = '';
        } else {
          this.deleteCardError = '无法删除该账户，请确认卡号状态';
        }
      } catch (error) {
        console.error(error);
        this.deleteCardError = '删除失败，请稍后重试';
      }
    },

    async getCardNO() {
      if (!this.queryIdentification) {
        this.queryIdentificationError = '请输入身份证号';
        return;
      }

      if (this.queryIdentification.length !== 18) {
        this.queryIdentificationError = '身份证号必须是18位';
        return;
      }

      try {
        const response = await api.get(`/account/getCardNO/${this.queryIdentification}`);
        if (response.data.code === 1) {
          if (response.data.data && response.data.data.length > 0) {
            this.cardNOList = response.data.data;
          } else {
            this.cardNOList = []; // 清空列表
            this.queryIdentificationError = '该身份证号未开户';
          }
        } else {
          this.queryIdentificationError = '查询失败';
        }
      } catch (error) {
        console.error(error);
        this.queryIdentificationError = '查询失败';
      }
    },

    async updateAccountStatus() {
      try {
        const response = await api.put('/account/updateAccountStatus', this.updateAccount);
        if (response.data.code === 1) {
          alert('更新成功');
          this.updateAccount.accountId = '';
          this.updateAccount.accountStatus = 'frozen';
        } else {
          alert('更新失败');
        }
      } catch (error) {
        console.error(error);
        alert('更新失败');
      }
    }
  }
};
</script>
  
<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  font-family: Arial, sans-serif;
}
  
h1 {
  text-align: center;
  color: #2196f3;
}
  
.form-group {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
  
h2 {
  color: #2196f3;
  margin-top: 0;
}
  
input[type="text"],
input[type="password"],
select {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
  
button {
  padding: 10px 20px;
  background-color: #2196f3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #1976d2;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
  
ul {
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
  
li {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

li:last-child {
  border-bottom: none;
}

.input-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.error-message {
  color: #ff4444;
  font-size: 12px;
  position: absolute;
  bottom: -20px;
  left: 0;
}

.form-group ul:empty {
  display: none;
}

.form-group li {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

.form-group li:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.form-group li:last-child {
  border-bottom: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
