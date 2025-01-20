<!-- src/views/chatpage.vue -->
<template>
  <div class="chat-page">
    <!-- 用户列表（会话列表） -->
    <div class="user-list">
      <ul>
        <li
          v-for="conversation in conversationList"

          :key="conversation.conversationID"
          :class="{ active: conversation.conversationID === target_user_id }"
          @click="selectUser(conversation.conversationID)"
        >
          {{ conversation.userProfile?.nick || conversation.conversationID }}
        </li>
      </ul>
    </div>

  
      <!-- 右侧聊天区域 -->
      <div class="chat-area">
        <!-- 消息展示区域 -->
        <div class="messages" ref="messagesContainer">
          <div
            v-for="msg in filteredMessages"
            :key="msg.timestamp"
            :class="['message', msg.from === self_user_id ? 'message-sent' : 'message-received']"
          >
            <div class="message-bubble">
              {{ msg.text }}
            </div>
          </div>
        </div>
  
        <!-- 输入框区域 -->
        <div class="input-area">
          <input
            v-model="messageText"
            @keyup.enter="sendMessageTO"
            placeholder="输入消息..."
          />
          <button @click="sendMessageTO">发送</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue';
  import { useBankOnlineStore } from '@/stores/bankonline';
  import {
    initIM,
    loginIM,
    sendMessage,
    logoutIM,
    messageList,
    getChatInstance,
    conversationList,
  } from '@/services/IMService';
  // import { genTestUserSig } from '@/services/GenerateUserSig';
  import axios from 'axios';
  import api from '@/api/api';



  interface Message {
    from: string;
    to: string;
    text: string;
    timestamp: number;
  }
  
  const messagesContainer = ref<HTMLElement | null>(null);
  const userOnlineStore = useBankOnlineStore();
  let self_user_id = userOnlineStore.self_user_id;
  const target_user_id = ref('user1');

  const SDKAppID = 1600065600; 


  
  const messageText = ref('');
  
  const filteredMessages = computed(() => {
    return messageList.value.filter(
      msg =>
        (msg.from === self_user_id && msg.to === target_user_id.value) ||
        (msg.from === target_user_id.value && msg.to === self_user_id)
    )

  });
  
  onMounted(async () => {
    const ID = userOnlineStore.ID;
    self_user_id = `admin${ID}`;
    userOnlineStore.setSelfUserId(self_user_id);
  
    // const { SDKAppID, userSig } = genTestUserSig(self_user_id);

    const { userSig } = await getUserSig(self_user_id);

    initIM(SDKAppID);
    await loginIM(self_user_id, userSig);
    setTimeout(async () => {
        await loadHistoryMessages();

    }, 10); // 0.01秒延迟
  });
  
  const scrollToBottom = async () => {
    await nextTick();
    // const container = document.querySelector('.messages');
    const container = messagesContainer.value;

    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  };
  
  watch(filteredMessages, () => {
    scrollToBottom();
  }, { deep: true });
  
  const selectUser = async (userID: string) => {
    target_user_id.value = userID.slice(3);
    userOnlineStore.setTargetUserId(target_user_id.value);
    await loadHistoryMessages();
  };
  
  const loadHistoryMessages = async () => {
    try {
      const history = await getChatInstance().getMessageList({
        conversationID: `C2C${target_user_id.value}`,
        // conversationID: target_user_id.value,

        // count: 10,
      });
  
      const formattedMessages = history.data.messageList.map((msg: any) => ({
        from: msg.from,
        to: msg.to,
        text: msg.payload.text,
        timestamp: msg.time * 1000,
      }));
  
      messageList.value = formattedMessages;
      scrollToBottom();
      console.log('历史消息加载成功', formattedMessages);
    } catch (error) {
      console.error('History load failed:', error);
    }
  };
  
  const sendMessageTO = async () => {
    if (messageText.value.trim() === '') return;
  
    try {
      await sendMessage(target_user_id.value, messageText.value);
      messageText.value = '';
      await loadHistoryMessages();//重要


      scrollToBottom();
    } catch (error) {
      console.error('Send failed:', error);
    }
  };


  /**
 * 获取 userSig
 * @param {string} userid - 用户ID
 * @param {number} [expire=604800] - 过期时间，默认7天（以秒为单位）
 * @returns {Promise<Object>} 返回一个包含 userSig 的对象的 Promise
 */
async function getUserSig(userid, expire = 604800) {
  try {
    const response = await api.get('/generateUserSig', {
      params: {
        userid,
        expire
      }
    });
    return { userSig: response.data };
  } catch (error) {
    console.error('Error generating userSig:', error);
    throw error; // 或者您可以选择返回一个默认值或空对象等
  }
}

  
  onUnmounted(() => {
    logoutIM();
  });
  </script>
  
 
  

  <style scoped>
  /* 聊天页面布局 */
  .chat-page {
    display: flex;
    height: 600px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  
  /* 用户列表 */
  .user-list {
    width: 200px;
    background-color: #f8f9fa;
    border-right: 1px solid #ddd;
    overflow-y: auto;
    padding: 0;
  }
  
  .user-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .user-list li {
    padding: 15px;
    cursor: pointer;
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.3s;
  }
  
  .user-list li.active,
  .user-list li:hover {
    background-color: #1890ff;
    color: #fff;
  }
  
  /* 聊天区域 */
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
  }
  
  /* 消息展示区域 */
  .messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    background-color: #fff;
  }
  
  .message {
    display: flex;
    margin-bottom: 10px;
  }
  
  .message-sent {
    justify-content: flex-end;
  }
  
  .message-received {
    justify-content: flex-start;
  }
  
  .message-bubble {
    max-width: 60%;
    padding: 10px 15px;
    border-radius: 8px;
    word-wrap: break-word;
  }
  
  .message-sent .message-bubble {
    background-color: #1890ff;
    color: #fff;
  }
  
  .message-received .message-bubble {
    background-color: #f1f1f1;
    color: #333;
    border: 1px solid #e0e0e0;
  }
  
  /* 输入框区域 */
  .input-area {
    display: flex;
    padding: 10px;
    background-color: #fff;
    border-top: 1px solid #ddd;
  }
  
  .input-area input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
  }
  
  .input-area input:focus {
    border-color: #1890ff;
    outline: none;
  }
  
  .input-area button {
    padding: 10px 20px;
    background-color: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .input-area button:hover {
    background-color: #40a9ff;
  }
  
  /* 隐藏滚动条 */
  .messages::-webkit-scrollbar,
  .user-list::-webkit-scrollbar {
    width: 0;
  }
  </style>
  