<template>
  <TopbarNavigation />
  <RouterView />
  <CustomSnackbar />
</template>

<script>
import { auth } from "./includes/firebase";
import { mapWritableState } from "pinia";
import { RouterView } from "vue-router";
import useUserStore from "@/stores/user";
import TopbarNavigation from "./components/navigation/TopbarNavigation.vue";
import CustomSnackbar from "./components/utilities/CustomSnackbar.vue";

export default {
  name: "App",
  components: {
    TopbarNavigation,
    RouterView,
    CustomSnackbar,
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
