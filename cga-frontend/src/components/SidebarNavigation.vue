<template>
  <v-card>
    <v-layout>
        <v-navigation-drawer expand-on-hover rail>
          <v-list class="navigation-avatar">
            <RouterLink to="/">
              <v-list-item prepend-avatar="/cassandra.png"
                          title="CGA"
                          subtitle="Cassandra">
              </v-list-item>
            </RouterLink>
          </v-list>
          <v-divider />
          <v-list density="compact" nav class="navigation-list">
            <RouterLink to="/data-structure">
              <v-list-item prepend-icon="mdi-family-tree"
                          title="Data Structure CG Design"
                          value="dataStructureCG">
              </v-list-item>
            </RouterLink>
            <RouterLink to="/query">
              <v-list-item prepend-icon="mdi-database-search"
                          title="Query CG Design"
                          value="queryCG">
              </v-list-item>
            </RouterLink>
          </v-list>
        </v-navigation-drawer>
      </v-layout>
  </v-card>    
</template>

<script>
export default {
    name: "SidebarNavigation"
};
</script>

<style scoped>
.v-list-item {
  color: black;
}
</style>