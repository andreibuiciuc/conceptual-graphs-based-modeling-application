<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
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
        <RouterLink to="/about">
          <v-list-item prepend-icon="mdi-family-tree"
                      title="Data Structure CG Design"
                      value="dataStructureCG">
          </v-list-item>
        </RouterLink>
        <RouterLink to="/about">
          <v-list-item prepend-icon="mdi-database-search"
                      title="Query CG Design"
                      value="queryCG">
          </v-list-item>
        </RouterLink>
      </v-list>
    </v-navigation-drawer>
  </v-layout>

  <RouterView />
</template>
