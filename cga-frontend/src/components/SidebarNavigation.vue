<template>
  <v-card>
    <v-layout>
        <v-navigation-drawer expand-on-hover rail>
          <v-list>
            <RouterLink :to="navigationHeader.pathTo">
              <v-list-item class="navigation-item"
                           :prepend-avatar="navigationHeader.avatar"
                           :title="navigationHeader.title"
                           :subtitle="navigationHeader.subtitle">
              </v-list-item>
            </RouterLink>
          </v-list>
          <v-divider />
          <v-list nav density="compact">
            <template v-for="navigationItem in navigationItems" :key="navigationItem.key">
              <RouterLink :to="navigationItem.pathTo">
                <v-list-item  class="navigation-item"
                              active-class="navigation-item--active"
                              :prepend-icon="navigationItem.icon"
                              :title="navigationItem.title"
                              :value="navigationItem.value">
                </v-list-item>
              </RouterLink>
            </template>
          </v-list>
        </v-navigation-drawer>
      </v-layout>
  </v-card>    
</template>

<script>
export default {
    name: "SidebarNavigation",
    data: () => {
      return {
        title: "CGA",
        subtitle: "Cassandra",
        navigationHeader: {
          title: "CGA",
          subtitle: "Cassandra",
          avatar: "/cassandra.png",
          pathTo: "/"
        },
        navigationItems: {
          dataStructureDesign: {
            key: "dataStructure",
            title: "Data Structure CG Design",
            value: "dataStructure",
            icon: "mdi-family-tree",
            pathTo: "/data-structure"
          },
          queryDesign: {
            key: "query",
            title: "Query CG Design",
            value: "query",
            icon: "mdi-database-search",
            pathTo: "/query"
          }
        },
        currentNavigationItem: null
      }
    },
};
</script>

<style scoped>
.navigation-item {
  color: var(--cassandra-gray);
}

.navigation-item--active {
  color: var(--cassandra-blue);
}
</style>