<template>
  <NPopover trigger="click">
    <template #trigger>
      <NButton secondary round v-bind="$attrs" class="bookmark-edit-instruction-button">
        <InformationOutlineIcon class="icon-24" />
        <i18n-t keypath="common.instruction" />
      </NButton>
    </template>
    <i18n-t keypath="page.bookmarks.edit_bookmark_instruction">
      <kbd>{{ highlightHotkey }}</kbd>
    </i18n-t>
  </NPopover>
</template>

<script lang="ts" setup>
import { NPopover, NButton } from 'naive-ui';

import { InformationOutlineIcon } from '@/component/icon';

const highlightHotkey = navigator.userAgent.includes('Mac') ? '⌘B' : 'Ctrl-B';
</script>

<style lang="scss" scoped>
@import './BookmarkEditInstructionButton';
</style>
