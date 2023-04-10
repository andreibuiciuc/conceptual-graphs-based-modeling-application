import { defineStore } from "pinia";

export default defineStore("authModal", {
  state: () => ({
    isModalOpened: false,
    isRegisterModalActive: true,
    currentScrollYPosition: 0,
    isSidebarOpened: false
  }),
});
