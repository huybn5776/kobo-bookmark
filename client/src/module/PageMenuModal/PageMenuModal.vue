<template>
  <div ref="elementRef" class="page-menu" :class="{ 'page-menu-nested': activeNestedMenu }">
    <template v-if="!activeNestedMenu">
      <button class="page-menu-item" @click="activeNestedMenu = 'language'">
        <WebIcon class="icon-24" />
        <span class="menu-item-text"><i18n-t keypath="page_menu.language" /></span>
      </button>
      <router-link :to="{ name: 'settings' }" class="page-menu-item" @click="closeMenu">
        <CogIcon class="icon-24" />
        <span class="menu-item-text"><i18n-t keypath="page_name.settings" /></span>
      </router-link>
    </template>

    <template v-if="activeNestedMenu">
      <div class="page-menu-head-item">
        <button class="page-menu-head-item-button" @click="activeNestedMenu = undefined">
          <ArrowLeftIcon class="icon-24" />
        </button>
        <span class="menu-item-text">{{ nestedMenuTitle }}</span>
      </div>
    </template>

    <PageLanguageMenu v-if="activeNestedMenu === 'language'" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, UnwrapRef } from 'vue';

import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import { WebIcon, CogIcon, ArrowLeftIcon } from '@/component/icon';
import { I18NMessageSchema } from '@/config/i18n-config';
import PageLanguageMenu from '@/module/PageMenuModal/component/PageLanguageMenu/PageLanguageMenu.vue';

const emits = defineEmits<{ (e: 'close'): void }>();

const { t } = useI18n<[I18NMessageSchema]>();

const elementRef = ref<HTMLElement>();

const nestedMenuTitles = computed(() => ({
  language: t('page_menu.language'),
}));

const activeNestedMenu = ref<keyof UnwrapRef<typeof nestedMenuTitles>>();
const nestedMenuTitle = computed(() => (activeNestedMenu.value ? nestedMenuTitles.value[activeNestedMenu.value] : ''));

onClickOutside(elementRef, closeMenu);
onKeyStroke('Escape', closeMenu);

function closeMenu(event: Event): void {
  event.stopPropagation();
  emits('close');
}
</script>

<style lang="scss" scoped>
@import './page-menu-modal';
</style>
