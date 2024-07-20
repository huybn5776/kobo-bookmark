<template>
  <div class="input-dialog-content">
    <NInput
      class="input-dialog-input"
      :type="type"
      :placeholder="placeholder"
      :value="value"
      :disabled="disabled"
      :autosize="autosize"
      :inputProps="inputProps"
      :status="status"
      @update:value="(v) => emit('update:value', v)"
    />
    <span v-if="errorMessage">❌ {{ errorMessage }}</span>
  </div>
</template>

<script lang="ts" setup>
import { NInput } from 'naive-ui';

defineProps<{
  type?: InstanceType<typeof NInput>['type'];
  placeholder: InstanceType<typeof NInput>['placeholder'];
  value: InstanceType<typeof NInput>['value'];
  disabled: InstanceType<typeof NInput>['disabled'];
  autosize: InstanceType<typeof NInput>['autosize'];
  inputProps: InstanceType<typeof NInput>['inputProps'];
  status: InstanceType<typeof NInput>['status'];
  errorMessage?: string;
}>();
const emit = defineEmits<{ (e: 'update:value', value: string): void }>();
</script>

<style lang="scss" scoped>
@import './InputDialogContent';
</style>
