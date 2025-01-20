// services/IMService.ts
import TencentCloudChat from '@tencentcloud/chat';
import TIMUploadPlugin from 'tim-upload-plugin';
import { ref } from 'vue';

interface Message {
  from: string;
  to: string;
  text: string;
  timestamp: number;
}

let chat: any;
const isReady = ref(false);
const pendingMessages: any[] = [];
export const messageList = ref<Message[]>([]);

// 新增会话列表
export const conversationList = ref<any[]>([]);

export const initIM = (SDKAppID: number) => {
  const options = { SDKAppID };
  chat = TencentCloudChat.create(options);
  chat.setLogLevel(0);
  chat.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });

  chat.on(TencentCloudChat.EVENT.SDK_READY, onSdkReady);
  chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
  chat.on(TencentCloudChat.EVENT.CONVERSATION_LIST_UPDATED, onConversationListUpdated);
};

const onSdkReady = async () => {
  console.log('SDK Ready');
  isReady.value = true;
  await loadConversationList();

  if (pendingMessages.length > 0) {
    pendingMessages.forEach((msg) => processIncomingMessage(msg));
    pendingMessages.length = 0;
  }
};

const onMessageReceived = (event: any) => {
  const messages = event.data;
  console.log('Received messages:', messages);

  if (!isReady.value) {
    pendingMessages.push(...messages);
    return;
  }

  messages.forEach((message: any) => processIncomingMessage(message));
};

const processIncomingMessage = (message: any) => {
  if (message.type === TencentCloudChat.TYPES.MSG_TEXT) {
    const newMessage = {
      from: message.from,
      to: message.to,
      text: message.payload.text,
      timestamp: message.time * 1000,
    };
    messageList.value = [...messageList.value, newMessage].slice(-10);
  }
};

const onConversationListUpdated = (event: any) => {
  console.log('会话列表更新:', event.data);
  conversationList.value = event.data;
};

export const loadConversationList = async () => {
  try {
    const response = await chat.getConversationList();
    conversationList.value = response.data.conversationList;
    console.log('会话列表加载成功:', conversationList.value);
  } catch (error) {
    console.error('加载会话列表失败:', error);
  }
};

export const loginIM = async (userID: string, userSig: string) => {
  try {
    const response = await chat.login({ userID, userSig });
    console.log('Login successful:', response.data);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const sendMessage = async (toUserID: string, messageText: string) => {
  try {
    const message = chat.createTextMessage({
      to: toUserID,
      conversationType: TencentCloudChat.TYPES.CONV_C2C,
      payload: { text: messageText },
    });

    const response = await chat.sendMessage(message);
    console.log('消息发送成功:', response);

    // 发送成功后，将消息添加到本地消息列表
    messageList.value.push({
      from: chat.userID,
      to: toUserID,
      text: messageText,
      timestamp: Date.now(),
    });
    return response;
  } catch (error) {
    console.error('Message send failed:', error);
    throw error;
  }
};

export const logoutIM = () => {
  if (chat) {
    chat.logout();
    chat.destroy();
    console.log('Logged out');
  }
};

export const getChatInstance = () => chat;
export const sdkReadyState = isReady;
