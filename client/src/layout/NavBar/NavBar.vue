<template>
  <nav class="nav-bar">
    <router-link :to="{ name: 'import' }" class="nav-bar-item nav-bar-link">
      <FileImportLineIcon class="nav-bar-item-icon" />
      <span class="nav-bar-item-text"><i18n-t keypath="page_name.import" /></span>
    </router-link>
    <router-link :to="{ name: 'bookmarks' }" class="nav-bar-item nav-bar-link">
      <BookmarksLineIcon class="nav-bar-item-icon" />
      <span class="nav-bar-item-text"><i18n-t keypath="page_name.bookmarks" /></span>
    </router-link>

    <button
      class="nav-bar-item nav-bar-button"
      :class="{ 'nav-bar-button-active': menuExpanded }"
      @click="toggleMenuExpanded"
    >
      <DotsVerticalIcon class="nav-bar-item-icon" />
      <span class="nav-bar-item-text"><i18n-t keypath="common.more" /></span>
    </button>

    <PageMenuModal v-if="menuExpanded" @close="menuExpanded = false" />
  </nav>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { FileImportLineIcon, BookmarksLineIcon, DotsVerticalIcon } from '@/component/icon';
import PageMenuModal from '@/module/PageMenuModal/PageMenuModal.vue';

const menuExpanded = ref<boolean>(false);

function toggleMenuExpanded(): void {
  menuExpanded.value = !menuExpanded.value;
}
</script>

<style lang="scss" scoped>
@import './NavBar';
</style>
