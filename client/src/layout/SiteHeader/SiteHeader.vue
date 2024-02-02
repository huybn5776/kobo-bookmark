<template>
  <header class="site-header">
    <div class="site-header-content-container">
      <router-link :to="{ name: 'home' }" class="site-logo-link">
        <h1 class="site-logo">Kobo bookmark</h1>
      </router-link>
      <NavBar />
    </div>
  </header>
</template>

<script lang="ts" setup>
import NavBar from '@/layout/NavBar/NavBar.vue';
</script>

<style lang="scss" scoped>
@import './SiteHeader';
</style>
