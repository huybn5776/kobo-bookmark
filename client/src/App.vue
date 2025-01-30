<template>
  <div class="app">
    <ProvidersWrapper>
      <SiteHeader />
      <div class="page-content-container">
        <router-view />
      </div>
    </ProvidersWrapper>
  </div>
</template>

<script lang="ts" setup>
import ProvidersWrapper from '@/layout/ProvidersWrapper/ProvidersWrapper.vue';
import SiteHeader from '@/layout/SiteHeader/SiteHeader.vue';
</script>

<style lang="scss">
@forward './App';
</style>
