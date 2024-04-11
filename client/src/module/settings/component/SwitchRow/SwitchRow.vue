<template>
  <button ref="switchRowRef" class="setting-row switch-row" @click="onSwitchRowClick">
    <NSwitch
      ref="switchRef"
      :value="valueModel"
      :disabled="disabled"
      :loading="loading"
      @update:value="valueModel = $event"
    />
    <span class="switch-row-content"><slot /></span>
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { NSwitch } from 'naive-ui';

defineProps<{ loading?: boolean; disabled?: boolean }>();
const valueModel = defineModel<boolean | undefined>('value');

const switchRowRef = ref<HTMLElement>();

function onSwitchRowClick(event: MouseEvent): void {
  if (isClickOnSwitch(event)) {
    return;
  }
  valueModel.value = !valueModel.value;
}

function isClickOnSwitch(event: MouseEvent): boolean {
  let element = event.target as HTMLElement | null;
  while (element && element !== switchRowRef.value) {
    if (element.getAttribute('role') === 'switch') {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}
</script>

<style lang="scss" scoped>
@import './SwitchRow';
@import '../settings';
</style>
