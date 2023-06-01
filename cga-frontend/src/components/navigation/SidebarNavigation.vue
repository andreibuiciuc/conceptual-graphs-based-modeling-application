<template>
  <Sidebar v-model:visible="isSidebarOpened" class="w-full md:w-25rem lg:w-30rem">
    <template #header>
      <InputSwitch v-model="forceGraph" :disabled="!currentKeyspace || isKeyspaceRetrieveInProgress" :class="{ 'animated-switch': !forceGraph && currentKeyspace }" />
      <span class="sidebar-header-label"> force graph {{ forceGraph ? 'on' : 'off' }}</span>
    </template>
    <div class="panel-container">
        <CredentialsCard />
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
        :disabled="!cassandraServerCredentials.isCassandraServerConnected || isKeyspaceRetrieveInProgress"
        :options="availableKeyspaces"
      />
      <Button 
        outlined
        severity="primary"
        icon="pi pi-sitemap"
        label="re-render conceptual graph"
        :disabled="!cassandraServerCredentials.isCassandraServerConnected || isKeyspaceRetrieveInProgress"
        @click="renderGraph"
      />
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import constants from '@/constants/constants';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from '@/stores/utils';
import { useConnectionStore } from '@/stores/connection';
import { computed, ComputedRef } from 'vue';
import CredentialsCard from '../dashboard/CredentialsCard.vue';


const connectionStore = useConnectionStore();
const { 
  cassandraServerCredentials, 
  isConnectionButtonTriggered, 
  currentKeyspace, availableKeyspaces, 
  userAstraDatabaseId, userAstraToken, 
  isKeyspaceRetrieveInProgress, 
  isRerenderTriggered 
} = storeToRefs(connectionStore);

cassandraServerCredentials.value = { ... constants.defaultLoginCredentials };

const utilsStore = useUtilsStore();
const { isSidebarOpened, forceGraph } = storeToRefs(utilsStore);

const isConnectionButtonEnabled: ComputedRef<boolean> = computed(() => {
    return !!userAstraDatabaseId.value && !!userAstraToken.value;
})

const manageServerConnection = (): void => {
  if (cassandraServerCredentials.value.isCassandraServerConnected) {
      connectionStore.disconnect();
  } else {
      connectionStore.connect();
  }
};

const renderGraph = async (): Promise<void> => {
  isRerenderTriggered.value = true;
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
    margin-top: 2rem

    input, .p-button, .p-dropdown
      width: 100%
      margin-bottom: 1rem

    .flex
      width: 100%

    .flex-column
      align-items: flex-start

</style>