// src/stores/bankonline.ts
import { defineStore } from "pinia";

export const useBankOnlineStore = defineStore("bankonline", {
  state: () => ({	
    token: localStorage.getItem("token") || "", 
    currentPage: "/bankonline/login", 
    ID:0,        //不用区分管理员/用户，当下登录的自然只有一种可能
    user: {
      name: '',
      age: 0
    },
    self_user_id: '',  // 当前用户（管理员）
    target_user_id: '',     // 当前聊天对象ID
    IsAdmin: true,          // 是否为管理员

 
  }),
    
  getters:{
    isLoggedIn:(state)=>!!state.token,
  },
  actions: {
     setTargetUserId(userId: string) {
        this.target_user_id = userId;
      },
      setSelfUserId(userId: string) {
        this.self_user_id = userId;
      },
      setIsAdmin(isAdmin: boolean) {
        this.IsAdmin = isAdmin;
      },
    setID (ID:number){
      this.ID = ID;
    },
    setToken(token: string ) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    clearToken() {
      this.token ="";
      this.user = {
      name:'null',
      age:0
      }
      },
        
      setUser(user: { name: string; age: number  }) {
        this.user = user;
      },

      setUserA(user: { name: string }){
        this.user.name = user.name;

      },
        
      setCurrentPage(page: string) {
        this.currentPage = page;
      },
    
  },
});
