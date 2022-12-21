<template>
  <v-card>
    <v-layout>
      <v-app-bar density="comfortable" flat elevation="1">
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
          <v-list class="flex">
            <RouterLink v-for="navigationItem in navigationItems" :key="navigationItem.key" :to="navigationItem.pathTo">
              <v-list-item  class="navigation-item"
                            :active="navigationItem.active"
                            active-class="navigation-item--active"
                            :prepend-icon="navigationItem.icon"
                            :title="navigationItem.title"
                            :value="navigationItem.value"
                            height="25"
                            @click="onNavigationItemClick(false, navigationItem.key)">
              </v-list-item>
            </RouterLink>
          </v-list>
        </v-app-bar-title>
      </v-app-bar>
    </v-layout>
  </v-card>
</template>

<script>
import navigationConstants from './navigationConstants.js';

export default {
    name: "SidebarNavigation",
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
      }
    },
    created: function () {
      this.navigationHeader = navigationConstants.toolbar.navigationHeader;
      this.navigationItems = navigationConstants.toolbar.navigationItems;
    }
};
</script>

<style scoped>
.v-card {
  z-index: 1;
}

.flex {
  display: flex;
}

.navigation-item {
  color: var(--cassandra-gray);
}

.navigation-item--active {
  color: var(--cassandra-blue);
}
</style>