<template>
    <Menubar :model="menuItems" :class="{ 'p-menubar-with-border-bottom': isUserLoggedIn || currentScrollYPosition > 0 }">
        <template #start>
            <img src="/cassandra.png" height="32" />
        </template>
        <template #item="{ item }">
          <RouterLink :to="item.to" class="p-menuitem-link">
            <i class="p-menuitem-icon" :class="item.icon"></i>
            <span class="p-menuitem-text">
              {{ item.label }}
            </span>
          </RouterLink>
        </template>
        <template #end>
            <div class="p-menuitem" @click="onAccountItemClick">
                <div class="p-menuitem-content">
                  <i class="p-menuitem-icon pi pi-user"></i>
                  <span class="p-menuitem-text">
                      {{ isUserLoggedIn ? 'sign out' : 'sign in' }}
                  </span>
                </div>
            </div>
        </template>
    </Menubar>
</template>

<script setup lang="ts">
import { menuItems } from './navigationConstants';

import { useConnectionStore } from '../../stores/connection';
import { useUserStore } from '../../stores/user';
import { useUtilsStore } from '../../stores/utils';

import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

// Composables
const userStore = useUserStore();
const { isUserLoggedIn } = storeToRefs(userStore);

const connectionStore = useConnectionStore();
const { cassandraServerCredentials } = storeToRefs(connectionStore);

const utilsStore = useUtilsStore();
const { currentScrollYPosition } = storeToRefs(utilsStore);

const router = useRouter();


// Functionalities related to the menubar navigation
const onAccountItemClick = (): void => {
  if (isUserLoggedIn.value) {
    if (cassandraServerCredentials.value.isCassandraServerConnected) {
      connectionStore.disconnect();
    }
    userStore.signOut();
    router.push({ name: 'home' });
  } else {
    const authSectionElement = document.getElementById('auth');
    if (authSectionElement) {
      authSectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }
};

</script>

<style lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.p-menubar
    z-index: 999
    background-color: variables.$cassandra-white !important
    border: none !important
    height: 68px

    &.p-menubar-with-border-bottom
        border-bottom: 1px solid variables.$cassandra-light-gray !important

    .p-menubar-start, .p-menubar-end
        @include containers.flex-container($align-items: center)
        padding: 0 1rem

    .p-menuitem-content:hover
      cursor: pointer
      background-color: #e9ecef

    .p-menubar-end .pi
        margin-right: 0.5rem

</style>