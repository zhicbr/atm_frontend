// /src/apiapi.js
import axios from 'axios';

const baseURL = import.meta.env.PROD 
  // ? 'http://112.124.37.249:8090'    //前后端分开部署
  ? '/'                                //前后端合并部署
  : '/api'                             //开发环境

const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;