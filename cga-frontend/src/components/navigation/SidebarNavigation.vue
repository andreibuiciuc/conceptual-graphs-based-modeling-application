<template>
  <Sidebar v-model:visible="isSidebarOpened" class="w-full md:w-25rem lg:w-30rem">
    <template #header>
      <InputSwitch v-model="forceGraph" />
      <span class="sidebar-header-label"> force graph {{ forceGraph ? 'on' : 'off' }}</span>
    </template>
    <div class="panel-container">
        <div class="flex flex-column gap-2">
          <small id="ip-help">enter the exposed IP address of your running cassandra network (server). example: 127.0.0.1, localhost, etc.</small>
          <InputText 
            v-model="cassandraServerCredentials.ipAddress"
            outlined 
            id="ip"
            placeholder="ip address" 
            maxlength="15"
            class="mt-4"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected" 
          />
        </div>
        <div class="flex flex-column gap-2">
          <small id="port-help">enter the exposed port number of your running cassandra network (server). example: 9042 (cassandra default), etc.</small>
          <InputText
            v-model="cassandraServerCredentials.port"
            outlined
            id="port"
            placeholder="port"
            maxlength="4"
            class="mt-2 mb-12"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected" 
          />
        </div>
        <Button 
          outlined 
          severity="primary" 
          label="prefill with default network" 
          :disabled="cassandraServerCredentials.isCassandraServerConnected"
          @click="autoCompleteServerCredentials" 
        />
        <Button 
          outlined
          severity="primary"
          :label="cassandraServerCredentials.isCassandraServerConnected ? 'disconnect' : 'connect'"
          :disabled="!isConnectionButtonEnabled || isConnectionButtonTriggered"
          :loading="isConnectionButtonTriggered"
          @click="manageServerConnection"
        />
    </div>
    <Divider />
    <div class="panel-container">
      <Dropdown
        v-model="currentKeyspace"
        outlined
        placeholder="keyspace"
        :disabled="!cassandraServerCredentials.isCassandraServerConnected"
        :options="availableKeyspaces"
      />
      <Button 
        outlined
        severity="primary"
        label="re-render conceptual graph"
        :disabled="!cassandraServerCredentials.isCassandraServerConnected"
        @click="renderGraph"
      />
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUtilsStore } from '../../stores/utils';
import { useConnectionStore } from '../../stores/connection';
import constants from '../../constants/constants';
import { Ref, ref, computed, ComputedRef } from 'vue';

const isConnectionButtonTriggered: Ref<boolean> = ref(false);
const isConnectionButtonEnabled: ComputedRef<boolean> = computed(() => {
    return !!cassandraServerCredentials.value.ipAddress && !!cassandraServerCredentials.value.port;
})

const connectionStore = useConnectionStore();
const { cassandraServerCredentials, currentKeyspace, availableKeyspaces } = storeToRefs(connectionStore);
cassandraServerCredentials.value = { ... constants.defaultLoginCredentials };

const utilsStore = useUtilsStore();
const { isSidebarOpened, forceGraph } = storeToRefs(utilsStore);

// Functions related to the connection and keyspace form
const autoCompleteServerCredentials = (): void => {
    cassandraServerCredentials.value = { ... constants.defaultCassandraNetwork };    
};

const manageServerConnection = (): void => {
  if (cassandraServerCredentials.value.isCassandraServerConnected) {
      connectionStore.disconnect();
  } else {
      connectionStore.connect();
  }
};

const renderGraph = async (): Promise<void> => {
  const currentKeyspaceValue = currentKeyspace.value;
  currentKeyspace.value = constants.inputValues.empty;
  currentKeyspace.value = currentKeyspaceValue;
} 

</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"

.p-sidebar
  width: 25rem !important
  
  .p-sidebar-header
    justify-content: space-between !important

    .p-sidebar-header-content
      @include containers.flex-container($flex-direction: row, $align-items: center)

      .sidebar-header-label
        margin-left: 1rem

  .p-sidebar-content
    padding-top: 2.5rem !important

  .panel-container
    @include containers.flex-container($flex-direction: column, $align-items: center)
    margin-top: 16px

    input, .p-button, .p-dropdown
      width: 100%
      margin-bottom: 1rem

</style>