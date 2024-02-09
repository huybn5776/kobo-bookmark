<template>
  <nav class="nav-bar">
    <router-link :to="{ name: 'import' }" class="nav-bar-link">Import</router-link>
    <router-link :to="{ name: 'bookmarks' }" class="nav-bar-link">Bookmarks</router-link>
    <router-link :to="{ name: 'settings' }" class="nav-bar-link">Settings</router-link>
  </nav>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@import './NavBar';
</style>
