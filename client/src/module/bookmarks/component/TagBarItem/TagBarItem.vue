<template>
  <div class="tag-bar-item" :class="{ 'tag-bar-item-clickable': clickable }">
    <span class="tag-bar-item-text">{{ label }}</span>
    <button v-if="allowRemove" class="tag-bar-item-remove-button" @click="onRemoveClick">
      <i18n-t keypath="common.remove" />
      <Icon name="close" class="icon-14" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/component/icon/Icon.vue';

defineProps<{ label: string; clickable?: boolean; allowRemove?: boolean }>();
const emit = defineEmits<{ (e: 'removeClick'): void }>();

function onRemoveClick(event: MouseEvent): void {
  event.stopPropagation();
  emit('removeClick');
}
</script>

<style lang="scss" scoped>
@forward './TagBarItem';
</style>
