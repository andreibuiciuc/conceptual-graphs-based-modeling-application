import { defineStore } from 'pinia'

export default defineStore("authModal", {
  state: () => {
    return {
      isModalOpened: false,
      isRegisterModalActive: true,
    };  
  },
});