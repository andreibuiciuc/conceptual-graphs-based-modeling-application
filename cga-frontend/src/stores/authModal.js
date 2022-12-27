import { defineStore } from 'pinia'

export default defineStore("authModal", {
  state: () => {
    isModalOpened: false
  },
});