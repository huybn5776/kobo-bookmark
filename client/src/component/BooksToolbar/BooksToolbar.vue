<template>
  <div class="books-toolbar" :class="{ 'books-toolbar-sticky': sticky }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ sticky: boolean }>();
</script>

<style lang="scss" scoped>
@forward './BooksToolbar';
</style>
