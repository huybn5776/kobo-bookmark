import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/module/home/HomePage.vue'),
  },
  {
    path: '/import',
    name: 'import',
    component: () => import('@/module/data-import/DataImportPage.vue'),
  },
  {
    path: '/bookmarks/:bookId?',
    name: 'bookmarks',
    component: () => import('@/module/bookmarks/BookmarksPage.vue'),
  },
  {
    path: '/collections/:collectionId/:bookId?',
    name: 'collections',
    component: () => import('@/module/bookmarks/BookmarksPage.vue'),
  },
  {
    path: '/tags/:tagId/:bookId?',
    name: 'tags',
    component: () => import('@/module/bookmarks/BookmarksPage.vue'),
  },
  {
    path: '/collections/:collectionId/tags/:tagId/:bookId?',
    name: 'collectionWithTag',
    component: () => import('@/module/bookmarks/BookmarksPage.vue'),
  },
  {
    path: '/share/:shareId/:bookId?',
    name: 'bookmarks-share',
    meta: { hideMainFunctions: true },
    component: () => import('@/module/bookmark-share/BookmarkSharePage.vue'),
  },
  {
    path: '/settings',
    alias: ['/settings/notion', '/settings/dropbox'],
    name: 'settings',
    component: () => import('@/module/settings/SettingsPage.vue'),
  },
  { path: '/:catchAll(.*)', redirect: { name: 'bookmarks' } },
];

const route = createRouter({
  history: createWebHistory(),
  routes,
});

export default route;
