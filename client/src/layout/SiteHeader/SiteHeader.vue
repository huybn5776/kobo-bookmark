<template>
  <header class="site-header">
    <div class="site-header-content-container">
      <router-link :to="{ name: 'home' }" class="site-logo-link">
        <svg viewBox="0 0 112 18" class="site-logo">
          <text x="0" y="14" fill="currentColor" font-weight="bold">Kobo bookmark</text>
        </svg>
        <span class="site-logo-text">Kobo bookmark</span>
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
