import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/module/home/HomePage.vue'),
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('@/module/bookmarks/BookmarksPage.vue'),
  },
  { path: '/:catchAll(.*)', redirect: { name: 'home' } },
];

const route = createRouter({
  history: createWebHistory(),
  routes,
});

export default route;
