import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import DataStructureView from '@/views/DataStructureView.vue'
import QueryView from '@/views/QueryView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/data-structure',
    name: 'data-structure',
    component: DataStructureView,
  },
  {
    path: '/query',
    name: 'query',
    component: QueryView
  },
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'home' }  
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
});

export default router
