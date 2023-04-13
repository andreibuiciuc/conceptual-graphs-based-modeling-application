<template>
  <div class="dashboard">
    <keyspace-graph :selected-keyspace="currentKeyspace" />
  </div>
</template>

<script setup lang="ts">
import KeyspaceGraph from "./items/KeyspaceGraph.vue";
import { useConnectionStore } from "../../stores/connection";
import { storeToRefs } from "pinia";

const connectionStore = useConnectionStore();
const { currentKeyspace } = storeToRefs(connectionStore);

</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"

.dashboard
  @include containers.flex-container($flex-direction: column, $align-items: center, $justify-content: center)
  width: 100%
  height: 100%
  
</style>
