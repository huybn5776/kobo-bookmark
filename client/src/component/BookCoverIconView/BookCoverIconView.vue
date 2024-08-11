<template>
  <img
    v-if="!failToLoadCoverImage"
    class="book-cover-icon-image"
    :src="src"
    :alt="title"
    @error="failToLoadCoverImage = true"
  />
  <Icon v-if="failToLoadCoverImage" name="blue-book" class="book-cover-fallback-icon" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import Icon from '@/component/icon/Icon.vue';

const props = defineProps<{ src?: string; title?: string }>();
const failToLoadCoverImage = ref(!props.src);
</script>

<style lang="scss" scoped>
@import './BookCoverIconView';
</style>
