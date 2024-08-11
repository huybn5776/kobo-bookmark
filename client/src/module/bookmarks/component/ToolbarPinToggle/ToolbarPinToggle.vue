<template>
  <div class="toolbar-pin-toggle" :class="{ 'toolbar-pin-toggle-pinned': pinModel }">
    <IconButton v-if="!pinModel" i18nKey="common.pin" @click="pinModel = true">
      <Icon name="pin-off" class="icon-24" />
    </IconButton>
    <IconButton v-if="pinModel" i18nKey="common.unpin" @click="pinModel = false">
      <Icon name="pin" class="icon-24" />
    </IconButton>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';

const pinModel = defineModel<boolean>('pin');
</script>

<style lang="scss" scoped>
@import './ToolbarPinToggle';
</style>
