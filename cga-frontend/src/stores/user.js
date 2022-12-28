import { defineStore } from "pinia";

export default defineStore("user", {
    state: () => {
        return {
            isUserLoggedIn: false
        }
    }
});