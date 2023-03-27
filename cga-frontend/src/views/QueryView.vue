<template>
  <div class="query-section">
    <div class="query-header-container elevation-1">
      <div>
        <span>Query Design</span>
      </div>
      <div class="query-header-actions">
        <v-btn variant="outline">
          Save
        </v-btn>
        <v-btn variant="outline">
          Generate Query
        </v-btn>
      </div>
    </div>
    <div class="query-canvas-wrapper">
      <div class="query-canvas">
        <div class="query-graph-container">

        </div>
        <div class="query-graph-container">

        </div>
      </div>
    </div>
    <div class="query-toolbox">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          title="Item"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        ></v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import useUserStore from "@/stores/user";

export default {
  name: "QueryView",
  beforeRouteEnter: function (_from, _to, next) {
    const store = useUserStore();
    if (store.isUserLoggedIn) {
      next();
    } else {
      next({ name: "home" });
    }
  },
};
</script>

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.query-section
  @include containers.flex-container($flex-direction: column)
  height: calc(100vh - variables.$cga-topbar-height)
  margin-top: variables.$cga-topbar-height

  .query-header-container
    @include containers.flex-container($flex-direction: row, $justify-content: space-between, $align-items: center)
    height: variables.$cga-header-height
    min-height: variables.$cga-header-height
    width: 100%
    padding: 10px 26px

    .query-header-actions
      @include containers.flex-container($flex-direction: row, $justify-content: flex-end, $align-items: center)

  .query-canvas-wrapper
    padding: 10px
    height: 100%
    width: 100%

    .query-canvas
      @include containers.flex-container($flex-direction: row)
      border: 1px solid variables.$cassandra-light-gray
      height: 100%

  .query-toolbox
    width: 100%
    padding: 10px

</style>
