<template>
  <Sidebar v-model:visible="isSidebarOpened" class="w-full md:w-25rem lg:w-30rem">
    <template #header>
      <InputSwitch v-model="forceGraph" :disabled="!currentKeyspace" :class="{ 'animated-switch': !forceGraph && currentKeyspace }" />
      <span class="sidebar-header-label"> force graph {{ forceGraph ? 'on' : 'off' }}</span>
    </template>
    <div class="panel-container">
        <div class="flex flex-column gap-2">
          <small id="ip-help">enter the exposed IP address of your cassandra server</small>
          <InputText 
            v-model="cassandraServerCredentials.ipAddress"
            outlined 
            id="ip"
            placeholder="ip address" 
            maxlength="15"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected" 
          />
        </div>
        <div class="flex flex-column gap-2">
          <small id="port-help">enter the exposed port number of your cassandra server</small>
          <InputText
            v-model="cassandraServerCredentials.port"
            outlined
            id="port"
            placeholder="port"
            maxlength="4"
            :disabled="cassandraServerCredentials.isCassandraServerConnected"
            :readonly="cassandraServerCredentials.isCassandraServerConnected" 
          />
        </div>
        <Button 
          outlined 
          severity="primary" 
          icon="pi pi-ellipsis-h"
          label="prefill with default network" 
          :disabled="cassandraServerCredentials.isCassandraServerConnected"
          @click="autoCompleteServerCredentials" 
        />
        <Button 
          outlined
          severity="primary"
          :icon="cassandraServerCredentials.isCassandraServerConnected ? 'pi pi-circle-fill' : 'pi pi-circle'"
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
        icon="pi pi-sitemap"
        label="re-render conceptual graph"
        :disabled="!cassandraServerCredentials.isCassandraServerConnected"
        @click="renderGraph"
      />
    </div>
    <Divider />
    <SyncronizeCard :are-tables-in-sync="true" />
  </Sidebar>
</template>

<script setup lang="ts">
import constants from '@/constants/constants';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from '@/stores/utils';
import { useConnectionStore } from '@/stores/connection';
import { Ref, ref, computed, ComputedRef } from 'vue';
import SyncronizeCard from '@/components/dashboard/SyncronizeCard.vue';

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
};

</script>

<style lang="sass">
@use "@/assets/styles/_containers.sass"
@use '@/assets/styles/_transitions.sass'


.p-sidebar
  width: 25rem !important
  
  .p-sidebar-header
    justify-content: space-between !important

    .p-sidebar-header-content
      @include containers.flex-container($flex-direction: row, $align-items: center)

      .sidebar-header-label
        margin-left: 1rem

  .p-sidebar-content
    padding-top: 1.5rem !important

  .panel-container
    @include containers.flex-container($flex-direction: column, $align-items: flex-start)
    margin-top: 16px

    input, .p-button, .p-dropdown
      width: 100%
      margin-bottom: 1rem

    .flex
      width: 100%

    .flex-column
      align-items: flex-start

</style>