<template>
  <v-card>
    <v-layout>
      <v-app-bar elevation="1" height="88">
        <template #prepend>
          <RouterLink :to="navigationHeader.pathTo">
            <v-list-item class="navigation-item"
                         :prepend-avatar="navigationHeader.avatar"
                         :title="navigationHeader.title"
                         :subtitle="navigationHeader.subtitle"
                         @click="onNavigationItemClick(true)">
            </v-list-item>
          </RouterLink>
        </template>
        <v-app-bar-title>
          <v-list class="navigation-items-list">
            <RouterLink v-for="navigationItem in navigationItems" :key="navigationItem.key" :to="navigationItem.pathTo">
              <v-list-item  class="navigation-item"
                            :active="navigationItem.active"
                            active-class="navigation-item--active"
                            :prepend-icon="navigationItem.icon"
                            :title="navigationItem.title"
                            :value="navigationItem.value"
                            @click="onNavigationItemClick(false, navigationItem.key)">
              </v-list-item>
            </RouterLink>
          </v-list>
        </v-app-bar-title>
        <template #append>
          <v-list>
            <a href="#auth"> 
              <v-list-item class="authentication-item" 
                          value="logIn" 
                          title="Log In"
                          append-icon="mdi-account">
              </v-list-item>
            </a>
          </v-list>
        </template>
      </v-app-bar>
    </v-layout>
  </v-card>
</template>

<script>
import navigationConstants from './navigationConstants.js';

export default {
    name: "TopbarNavigation",
    data: () => {
      return {
        title: "CGA",
        subtitle: "Cassandra",
        navigationHeader: null,
        navigationItems: null,
        currentNavigationIndex: 0
      };
    },
    methods: {
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
    },
    created: function () {
      this.navigationHeader = navigationConstants.toolbar.navigationHeader;
      this.navigationItems = navigationConstants.toolbar.navigationItems;
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

</style>