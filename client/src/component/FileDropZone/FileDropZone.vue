<template>
  <div ref="dropTargetRef" class="file-drop-zone">
    <slot />
    <div ref="dropOverlayRef" class="drag-overlay" :style="{ visibility: fileDragEnter ? 'visible' : 'hidden' }"></div>
  </div>
</template>

<script lang="ts" setup>
import { useDropArea } from '@/composition/use-drop-area';

const props = defineProps<{ targetPath: string }>();
const emits = defineEmits<{ (e: 'fileDropped', value: Record<string, File>): void }>();

const { dropTargetRef, dropOverlayRef, fileDragEnter } = useDropArea({
  fileDropped: (filesMap) => emits('fileDropped', filesMap),
  targetPath: props.targetPath,
});
</script>

<style lang="scss" scoped>
@import './FileDropZone';
</style>
