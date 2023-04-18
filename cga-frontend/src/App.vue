<template>
  <CgaMenubar />
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

export default {
  name: "App",
  components: {
    RouterView,
    SidebarNavigation,
    CgaMenubar
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