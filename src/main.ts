// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);

const pinia = createPinia();

app.use(router);
app.use(ElementPlus);

app.use(pinia).mount('#app')