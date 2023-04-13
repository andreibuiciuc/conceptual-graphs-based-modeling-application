<template>
  <TopbarNavigation />
  <SidebarNavigation />
  <RouterView />
  <Toast />
</template>

<script>
import { auth } from "./includes/firebase";
import { mapWritableState } from "pinia";
import { RouterView } from "vue-router";
import { useUserStore } from './stores/user';
import TopbarNavigation from "./components/navigation/TopbarNavigation.vue";
import SidebarNavigation from "./components/navigation/SidebarNavigation.vue";

export default {
  name: "App",
  components: {
    TopbarNavigation,
    RouterView,
    SidebarNavigation
},
  computed: {
    ...mapWritableState(useUserStore, ["isUserLoggedIn"]),
  },
  created: function () {
    if (auth.currentUser) {
      this.isUserLoggedIn = true;
    }
  },
};
</script>