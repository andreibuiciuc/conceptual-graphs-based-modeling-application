<template>
  <div class="flex">
    <CGDesignToolbox />
  </div>
</template>

<script>
import CGDesignToolbox from '../components/design/CGDesignToolbox.vue';
import useUserStore from '@/stores/user';

export default {
  name: "DataStructureView",
  components: {
    CGDesignToolbox
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