<template>
  <div class="flex">
    <h1>Data Structure Conceptual Graph Design</h1>
  </div>
</template>

<script>
import useUserStore from '@/stores/user';

export default {
  name: "DataStructureView",
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

.flex 
  @include containers.flex-container($flex-direction: row, $justify-content: center, $align-items: center)
  height: 100vh

</style>