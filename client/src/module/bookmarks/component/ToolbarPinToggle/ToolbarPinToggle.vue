<template>
  <div class="toolbar-pin-toggle" :class="{ 'toolbar-pin-toggle-pinned': pinModel }">
    <IconButton v-if="!pinModel" i18nKey="common.pin" @click="pinModel = true">
      <PinOffIcon class="icon-24" />
    </IconButton>
    <IconButton v-if="pinModel" i18nKey="common.unpin" @click="pinModel = false">
      <PinIcon class="icon-24" />
    </IconButton>
  </div>
</template>

<script lang="ts" setup>
import { PinIcon, PinOffIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';

const pinModel = defineModel<boolean>('pin');
</script>

<style lang="scss" scoped>
@import './ToolbarPinToggle';
</style>
