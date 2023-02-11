<template>
  <div class="flex">
    <DesignDashboard />
  </div>
</template>

<script>
import useUserStore from '@/stores/user';
import DesignDashboard from '../components/design/DesignDashboard.vue';

export default {
  name: "DataStructureView",
  components: {
    DesignDashboard
},
  beforeRouteEnter: function (_from, _to, next) {
    const store = useUserStore();
    if (store.isUserLoggedIn) {
      next();
    } else {
      next({ name: "home" });
    }
  }
}
</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"
@use "@/assets/styles/_variables.sass"

.flex 
  @include containers.flex-container($flex-direction: row, $justify-content: start, $align-items: start)
  margin-top: calc(variables.$cga-topbar-height + 2.5rem)
  margin-left: 2.5rem
  height: 100vh

</style>