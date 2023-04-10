<template>
  <div class="dashboard">
    <connection-console @changekeyspace="selectedKeyspace = $event" />
    <keyspace-graph :selected-keyspace="selectedKeyspace" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import constants from '../../constants/constants';
import ConnectionConsole from "./items/ConnectionConsole.vue";
import KeyspaceGraph from "./items/KeyspaceGraph.vue";

const selectedKeyspace: Ref<string> = ref(constants.inputValues.empty);

</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"

.dashboard
  @include containers.flex-container($flex-direction: column, $align-items: center, $justify-content: center)
  width: 100%
  height: 100%
  
</style>
