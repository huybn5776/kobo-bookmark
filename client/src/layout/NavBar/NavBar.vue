<template>
  <nav class="nav-bar">
    <router-link :to="{ name: 'notion' }" class="nav-bar-link">Notion settings</router-link>
    <router-link :to="{ name: 'bookmarks' }" class="nav-bar-link">Bookmarks</router-link>
  </nav>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@import './NavBar';
</style>
