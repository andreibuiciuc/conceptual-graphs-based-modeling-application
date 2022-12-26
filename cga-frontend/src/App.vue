<template>
  <SidebarNavigation />
  <RouterView />
</template>

<script>
import { RouterView } from 'vue-router'
import SidebarNavigation from './components/navigation/SidebarNavigation.vue'

export default {
  name: "App",
  components: {
    SidebarNavigation
  },
}
</script>
