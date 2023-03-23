<template>
  <router-view />
  <topbar-navigation />
  <custom-snackbar />
</template>

<script>
import { auth } from './includes/firebase';

import { mapWritableState } from 'pinia';
import useUserStore from '@/stores/user';

import { RouterView } from 'vue-router'

import TopbarNavigation from './components/navigation/TopbarNavigation.vue'
import CustomSnackbar from '@/components/utilities/CustomSnackbar.vue'

export default {
  name: "App",
  components: {
    TopbarNavigation,
    CustomSnackbar
  },
  computed: {
    ...mapWritableState(useUserStore, ["isUserLoggedIn"])
  },
  created: function () {
    if (auth.currentUser) {
      this.isUserLoggedIn = true;
    }
  }
}
</script>
