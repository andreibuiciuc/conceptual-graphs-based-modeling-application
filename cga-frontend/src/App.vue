<template>
  <CgaMenubar />
  <!-- <TopbarNavigation /> -->
  <SidebarNavigation />
  <RouterView />
  <Toast />
</template>

<script>
import { auth } from "./includes/firebase";
import { mapWritableState } from "pinia";
import { RouterView } from "vue-router";
import { useUserStore } from './stores/user';
import SidebarNavigation from "./components/navigation/SidebarNavigation.vue";
import CgaMenubar from "./components/navigation/CgaMenubar.vue";
import TopbarNavigation from "./components/navigation/TopbarNavigation.vue";

export default {
  name: "App",
  components: {
    RouterView,
    SidebarNavigation,
    CgaMenubar,
    TopbarNavigation
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