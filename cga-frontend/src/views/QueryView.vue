<template>
  <div class="query-section">
    <div class="query-header-container elevation-1">
      <div>
        <span>Query Design</span>
      </div>
      <div class="query-header-actions">
        <v-select variant="text"
          :disabled="!currentKeyspace"
          :hide-details="true"
          :items="availableTables"
        >
        </v-select>
        <v-btn variant="text">
          Save
        </v-btn>
        <v-btn variant="text">
          Generate Query
        </v-btn>
      </div>
    </div>
    <div class="query-canvas-wrapper">
      <div class="query-canvas">
      </div>
      <div class="query-canvas">
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
import constants from '../constants/constants';
import useUserStore from "@/stores/user";
import useConnectionStore from '../stores/connection';
import useNotificationStore from '../stores/notification';
import { mapState, mapActions } from 'pinia';
import { manageRequest } from "@/includes/requests";

export default {
  name: "QueryView",
  data: () => ({
    availableTables: []
  }),
  computed: {
    // These computed properties are mapped from the Connection Store
    ...mapState(useConnectionStore, ['currentKeyspace'])
  },
  methods: {
    // These methods are mapped from the Notification Store
    ...mapActions(useNotificationStore, ['setUpSnackbarState']),
    // These methods handle the retrieve of entities
    retrieveAvailableTables: async function () {
      const response = await manageRequest(constants.requestTypes.GET, "tables", { 
        keyspace_name: this.currentKeyspace
      });
      if (response) {
        if (response.data.status === constants.requestStatus.SUCCESS) {
          this.availableTables = JSON.parse(JSON.stringify(response.data.tables));
        }
      }
    }
  },
  created: function () {
    if (this.currentKeyspace) {
      this.retrieveAvailableTables();
    }
  },
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

      & > *:not(:last-child)
        margin-right: 10px

  .query-canvas-wrapper
    @include containers.flex-container($flex-direction: row)
    padding: 10px
    height: 100%
    width: 100%

    .query-canvas
      position: relative
      border: 1px solid variables.$cassandra-light-gray
      height: 100%
      width: 50%
      resize: horizontal
      overflow: auto

      &:first-of-type
        margin-right: 20px

  .query-toolbox
    width: 100%
    padding: 10px

</style>
