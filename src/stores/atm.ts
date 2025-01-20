//src/stores/atm.ts
import { defineStore } from "pinia";

export const useATMStore = defineStore("atm", {
  state: () => ({
    selectedCard: {
      cardNumber: localStorage.getItem("cardNumber") || '', 
      balance: 0, 
    },
	
    token: localStorage.getItem("token") || "", 
    currentPage: "/atm/welcome", 
    atm:{
      id:0,
      location:''
    }
  }),
  
  actions: {
    setAtm(atm: {id:number,location:string}){
      this.atm = atm;
    },
    // selectCard(card: { cardNumber: string; balance: number }) {
    //   this.selectedCard = card; 
    // },
    selectCardNumber(cardNumber: string) {
      this.selectedCard.cardNumber = cardNumber;
      localStorage.setItem("cardNumber", cardNumber);
    },
    selectBalance(balance: number) {
      this.selectedCard.balance = balance;
    },
    
    addBalance(amount: number) {
      this.selectedCard.balance += amount;
    },
    deductBalance(amount: number) {
      if (this.selectedCard.balance >= amount) {
        this.selectedCard.balance -= amount;
      } else {
        throw new Error('余额不足');
      }
    },
  
    setToken(token: string ) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    clearToken() {
        this.token ="";
        this.selectedCard = {
          cardNumber: '', 
          balance: 0,
        }
      },
	
    setCurrentPage(page: string) {
      this.currentPage = page;
    },

  },
});