<template>
    <v-layout>
      <v-app-bar :elevation="currentScrollYPosition > 0 ? 1 : 0" height="88" :class="currentScrollYPosition > 0 ? 'app-bar--transparent' : ''">
        <template #prepend>
          <RouterLink :to="{ name: navigationHeader.pathTo }">
            <v-list-item
              class="navigation-item"
              :prepend-avatar="navigationHeader.avatar"
              :title="navigationHeader.title"
              :subtitle="navigationHeader.subtitle"
              @click="onNavigationItemClick(true)"
            >
            </v-list-item>
          </RouterLink>
        </template>
        <v-app-bar-title>
          <v-list class="navigation-items-list" v-if="isUserLoggedIn">
            <RouterLink
              v-for="navigationItem in navigationItems"
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
              @click="onAccountActionItemClick"
            >
            </v-list-item>
          </v-list>
        </template>
      </v-app-bar>
    </v-layout>
</template>

<script>
import navigationConstants from "./navigationConstants.js";

import { mapActions, mapState, mapWritableState } from "pinia";
import useUserStore from "@/stores/user";
import useConnectionStore from "@/stores/connection";
import useAuthModalStore from "@/stores/authModal";

export default {
    name: "TopbarNavigation",
    props: {
      scrollYPosition: Number
    },
    data: function () {
      return {
        title: "CGA",
        subtitle: "Cassandra",
        navigationHeader: null,
        navigationItems: null,
        currentNavigationIndex: 0,
      };
    },
    computed: {
      ...mapState(useConnectionStore, ["cassandraServerCredentials"]),
      ...mapWritableState(useUserStore, ["isUserLoggedIn", "userCredentials"]),
      ...mapState(useAuthModalStore, ["currentScrollYPosition"])
    },  
    methods: {
      // These methods are mapped from the user store.
      ...mapActions(useUserStore, ["signOut"]),
      // These methods are mapped from the connection store.
      ...mapActions(useConnectionStore, ["disconnect"]),
      // These methods are component level based
      onNavigationItemClick: function (isHomeLink, navigationItemKey) {
        if (isHomeLink) {
          this.navigationItems[this.currentNavigationIndex].active = false;
          return;
        }
        const index = this.navigationItems.findIndex(x => x.key === navigationItemKey);
        if (index > -1 && this.navigationItems[index]) {
          this.navigationItems[this.currentNavigationIndex].active = false;
          this.navigationItems[index].active = true;
          this.currentNavigationIndex = index;
        }
      },
      // These methods handle the signing out process
      onAccountActionItemClick: function () {
        if (this.isUserLoggedIn) {
          if (this.cassandraServerCredentials.isCassandraServerConnected) {
            this.disconnect();
          }
          this.signOut();
          this.$router.push({ name: "home" });
          return;
        }
        const authSectionElement = document.getElementById('auth');
        if (authSectionElement) {
          authSectionElement.scrollIntoView({ behavior: 'smooth' });
        }
    },
  },
  created: function () {
    this.navigationHeader = navigationConstants.toolbar.navigationHeader;
    this.navigationItems = navigationConstants.toolbar.navigationItems;
  },
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
