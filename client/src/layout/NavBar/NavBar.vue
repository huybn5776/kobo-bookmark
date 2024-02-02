<template>
  <nav class="nav-bar">
    <router-link :to="{ name: 'bookmarks' }" class="nav-bar-link">Bookmarks</router-link>
  </nav>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@import './NavBar';
</style>
