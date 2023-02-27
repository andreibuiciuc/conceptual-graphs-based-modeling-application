<template>
  <div class="dashboard">
    <connection-console @changekeyspace="selectedKeyspace = $event" />
    <keyspace-graph :selected-keyspace="selectedKeyspace" />
  </div>
</template>

<script>
import constants from "@/constants/constants";
import ConnectionConsole from "./items/ConnectionConsole.vue";
import KeyspaceGraph from "./items/KeyspaceGraph.vue";

export default {
  name: "ConnectionDashboard",
  components: {
    ConnectionConsole,
    KeyspaceGraph,
  },
  data: () => ({
    selectedKeyspace: constants.inputValues.empty,
  }),
};
</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"

.dashboard
  @include containers.flex-container($flex-direction: row)
  height: 100%
  width: 100%
</style>
