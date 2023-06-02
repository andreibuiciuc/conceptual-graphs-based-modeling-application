<template>
  <TopbarNavigation />
  <SidebarNavigation />
  <RouterView />
  <Toast />
</template>

<script lang="ts">

import SidebarNavigation from "@/components/navigation/SidebarNavigation.vue";
import TopbarNavigation from '@/components/navigation/TopbarNavigation.vue';

import { auth } from "./configurations/firebase";
import { mapWritableState } from "pinia";
import { RouterView } from "vue-router";
import { useUserStore } from './stores/user';

export default {
  name: "App",
  components: {
    RouterView,
    SidebarNavigation,
    TopbarNavigation,
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