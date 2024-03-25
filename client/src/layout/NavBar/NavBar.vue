<template>
  <nav class="nav-bar">
    <router-link :to="{ name: 'import' }" class="nav-bar-link">
      <i18n-t keypath="page_name.import" />
    </router-link>
    <router-link :to="{ name: 'bookmarks' }" class="nav-bar-link">
      <i18n-t keypath="page_name.bookmarks" />
    </router-link>
    <router-link :to="{ name: 'settings' }" class="nav-bar-link">
      <i18n-t keypath="page_name.settings" />
    </router-link>
  </nav>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@import './NavBar';
</style>
