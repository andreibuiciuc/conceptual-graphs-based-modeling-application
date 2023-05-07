<template>
  <Menubar 
    :model="menuItems" 
    :class="{ 'p-menubar-translucent': isTranslucentEffectApplied, 
              'p-menubar-solid': !isTranslucentEffectApplied, 
              'p-menubar-with-border-bottom': isBorderBottomAppliedToMenubar }"
  >
    <template #start>
      <RouterLink :to="{ name: 'home' }">
        <img src="/cassandra.png" height="32" />
      </RouterLink>
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
import { authenticatedMenuItems, unauthenticatedMenuItems } from './navigationConstants';

import { useConnectionStore } from '../../stores/connection';
import { useUserStore } from '../../stores/user';
import { useUtilsStore } from '../../stores/utils';

import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ComputedRef, computed } from 'vue';
import { MenuItem } from '@/types/navigation/types';

const SCROLL_Y_POSITION_OFFSET = 10;

// Composables
const userStore = useUserStore();
const { isUserLoggedIn } = storeToRefs(userStore);

// Store mappings
const connectionStore = useConnectionStore();
const { cassandraServerCredentials } = storeToRefs(connectionStore);

const utilsStore = useUtilsStore();
const { currentScrollYPosition, isLoginInModal } = storeToRefs(utilsStore);

// Router
const router = useRouter();


// Functionalities related to the menubar configurations
const isBorderBottomAppliedToMenubar: ComputedRef<boolean> = computed(() => {
  return !isUserLoggedIn.value ? currentScrollYPosition.value > SCROLL_Y_POSITION_OFFSET : true;
});

const isTranslucentEffectApplied: ComputedRef<boolean> = computed(() => {
  return !isUserLoggedIn.value || ['/'].includes(router.currentRoute.value.path);
});


// Functionalities related to the menubar navigation
const menuItems: ComputedRef<MenuItem[]> = computed(() => {
  if (isUserLoggedIn.value) {
    return authenticatedMenuItems;
  } else {
    return unauthenticatedMenuItems;
  }
});

const onAccountItemClick = (): void => {
  if (isUserLoggedIn.value) {
    if (cassandraServerCredentials.value.isCassandraServerConnected) {
      connectionStore.disconnect();
    }
    userStore.signOut();
    router.push({ name: 'home' });
  } else {
    if (router.currentRoute.value.name === 'home') {
      const authSectionElement = document.getElementById('auth');
      if (authSectionElement) {
        authSectionElement.scrollIntoView({ behavior: "smooth", block: 'end' });
      }
    } else {
      isLoginInModal.value = true;
    }
  }
};

</script>

<style scoped lang="sass">
@use '@/assets/styles/_variables.sass'
@use '@/assets/styles/_containers.sass'

.p-menubar-translucent
  background: none !important
  -webkit-backdrop-filter: blur(8px) !important
  backdrop-filter: blur(8px) !important

.p-menubar-solid
  background: variables.$cassandra-white !important

.p-menubar
  position: fixed
  height: 68px
  z-index: 1004
  transform: translateY(0%)
  width: 100%
  border-bottom: none !important

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