<template>
  <TopbarNavigation />
  <RouterView />
</template>

<script>
import { RouterView } from 'vue-router'
import TopbarNavigation from './components/navigation/TopbarNavigation.vue'

export default {
  name: "App",
  components: {
    TopbarNavigation
  },
}
</script>
