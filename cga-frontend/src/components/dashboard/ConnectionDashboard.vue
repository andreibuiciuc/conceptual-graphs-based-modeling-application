<template>
  <div class="dashboard">
    <connection-console @changekeyspace="selectedKeyspace = $event" @limit="conceptualGraphLeftLimit = $event"/>
    <keyspace-graph :selected-keyspace="selectedKeyspace" :left-limit="conceptualGraphLeftLimit" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import constants from '../../constants/constants';
import ConnectionConsole from "./items/ConnectionConsole.vue";
import KeyspaceGraph from "./items/KeyspaceGraph.vue";

const selectedKeyspace: Ref<string> = ref(constants.inputValues.empty);
const conceptualGraphLeftLimit: Ref<number> = ref(0);

</script>

<style scoped lang="sass">
@use "@/assets/styles/_containers.sass"

.dashboard
  @include containers.flex-container($flex-direction: row)
  height: 100%
  width: 100%
</style>
