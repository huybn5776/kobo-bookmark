<template>
  <div class="book-shape-graph" :style="{ transform }">
    <div class="book-shape book-shape-top">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M1200,0H0V120H350C550,100,600,10,600,10h0S650,100,950,120h277Z" class="shape-fill" />
      </svg>
    </div>

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" class="book-spine">
      <rect x="49.5" y="0" width="1" height="100" />
    </svg>

    <div class="book-shape book-shape-bottom">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M1200,0H0V120H350C550,100,600,10,600,10h0S650,100,950,120h277Z" class="shape-fill" />
      </svg>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useEventListener } from '@vueuse/core';

const scrollTop = ref(0);
const transform = computed(() => `translateY(${-scrollTop.value * 0.4}px)`);

useEventListener(document.querySelector('.app'), 'scroll', (event) => {
  scrollTop.value = (event.target as HTMLElement).scrollTop;
});
</script>

<style lang="scss" scoped>
@forward './BookShapeGraph';
</style>
