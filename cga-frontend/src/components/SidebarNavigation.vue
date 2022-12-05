<template>
  <v-card>
    <v-layout>
        <v-navigation-drawer expand-on-hover rail>
          <v-list class="navigation-avatar">
            <RouterLink :to="navigationHeader.pathTo">
              <v-list-item :prepend-avatar="navigationHeader.avatar"
                           :title="navigationHeader.title"
                           :subtitle="navigationHeader.subtitle">
              </v-list-item>
            </RouterLink>
          </v-list>
          <v-divider />
          <v-list class="navigation-list" density="compact" nav>
            <template v-for="navigationItem in navigationItems" :key="navigationItem.value">
              <RouterLink :to="navigationItem.pathTo">
                <v-list-item :prepend-icon="navigationItem.icon"
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
    data: function () {
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
            title: "Data Structure CG Design",
            value: "dataStructure",
            icon: "mdi-family-tree",
            pathTo: "/data-structure"
          },
          queryDesign: {
            title: "Query CG Design",
            value: "query",
            icon: "mdi-database-search",
            pathTo: "/query"
          }
        }
      }
    }
};
</script>

<style scoped>
.v-list-item {
  color: var(--cassandra-gray);
}

.v-list-item--active {
  color: var(--cassandra-blue) !important;
}
</style>