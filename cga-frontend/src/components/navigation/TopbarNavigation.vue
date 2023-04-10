<template>
    <v-layout>
      <v-app-bar :elevation="currentScrollYPosition > 0 ? 1 : 0" height="88" :class="currentScrollYPosition > 0 ? 'app-bar--transparent' : ''">
        <template #prepend>
          <RouterLink :to="{ name: appToolbar.navigationHeader.pathTo }">
            <v-list-item
              class="navigation-item"
              :prepend-avatar="appToolbar.navigationHeader.avatar"
              :title="appToolbar.navigationHeader.title"
              :subtitle="appToolbar.navigationHeader.subtitle"
              @click="onNavigationItemClick(true)"
            >
            </v-list-item>
          </RouterLink>
        </template>
        <v-app-bar-title>
          <v-list class="navigation-items-list" v-if="isUserLoggedIn">
            <RouterLink
              v-for="navigationItem in appToolbar.navigationItems"
              :key="navigationItem.key"
              :to="{ name: navigationItem.pathTo }"
            >
              <v-list-item
                class="navigation-item"
                :active="navigationItem.active"
                active-class="navigation-item--active"
                :prepend-icon="navigationItem.icon"
                :title="navigationItem.title"
                :value="navigationItem.value"
                @click="onNavigationItemClick(false, navigationItem.key)"
              >
              </v-list-item>
            </RouterLink>
          </v-list>
        </v-app-bar-title>
        <template #append>
          <v-list>
            <v-list-item
              class="authentication-item"
              :value="isUserLoggedIn ? 'signOut' : 'signIn'"
              :title="isUserLoggedIn ? 'Sign Out' : 'Sign In'"
              append-icon="mdi-account"
              @click="onAccountItemClick"
            >
            </v-list-item>
          </v-list>
        </template>
      </v-app-bar>
    </v-layout>
</template>

<script setup lang="ts">
import { Toolbar, toolbar} from "./navigationConstants.js";
import useUserStore from '../../stores/user';
import useConnectionStore from '../../stores/connection';
import useAuthModalStore from '../../stores/authModal';
import { Ref, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const appToolbar: Ref<Toolbar> = ref( { ... toolbar });
const currentNavigationIndex: Ref<number> = ref(0);

const userStore = useUserStore();
const connectionStore = useConnectionStore();
const authModalStore = useAuthModalStore();

const { isUserLoggedIn } = storeToRefs(userStore);
const { cassandraServerCredentials } = storeToRefs(connectionStore);
const { currentScrollYPosition } = storeToRefs(authModalStore);

const router = useRouter();

// Functions related to the navigation flow
const onNavigationItemClick = (isHomeLink: boolean, navigationItemKey?: string): void => {
  if (isHomeLink) {
    appToolbar.value.navigationItems[currentNavigationIndex.value].active = false;
  } else {
    const index = appToolbar.value.navigationItems.findIndex(x => x.key && x.key === navigationItemKey);
    if (index > -1 && appToolbar.value.navigationItems[index]) {
      appToolbar.value.navigationItems[currentNavigationIndex.value].active = false;
      appToolbar.value.navigationItems[index].active = true;
      currentNavigationIndex.value = index;
    }
  }
};

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

<style scoped lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_containers.sass"

.v-card
  z-index: 9999

.navigation-items-list
  @include containers.flex-container($flex-direction: row)

.navigation-item, .authentication-item
  color: variables.$cassandra-gray

.navigation-item--active
  color: variables.$cassandra-blue

.app-bar--transparent
  background-color: hsla(0,0%,100%,.8)
  backdrop-filter: saturate(180%) blur(5px)

</style>
