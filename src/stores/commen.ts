//src/stores/commen.ts
import { defineStore } from "pinia";

export const useCommonStore = defineStore("commen", {
  state: () => ({
    state:1     //  1表示atm，2表示bankonline
  }),
  
  
  actions: {

    setState(state: number){
        this.state = state;
    }
    

  },
});