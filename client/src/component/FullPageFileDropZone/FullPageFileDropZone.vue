<template>
  <div
    v-if="enabled"
    ref="dropOverlayRef"
    class="full-page-file-drop-zone-overlay"
    :style="{ visibility: fileDragEnter ? 'visible' : 'hidden' }"
  />
  <div
    class="full-page-file-drop-zone-message-container"
    :class="{ 'full-page-file-drop-overlay-message-container-hidden': !fileDragEnter }"
  >
    <div class="full-page-file-drop-zone-message">
      <Icon name="import" class="icon-24" />
      <span class="full-page-file-drop-zone-message-text"><slot /></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

import Icon from '@/component/icon/Icon.vue';
import { useDropArea } from '@/composition/use-drop-area';

const props = defineProps<{ targetPath: string; dropTarget: HTMLElement | undefined; enabled: boolean }>();
const emit = defineEmits<{ (e: 'fileDropped', value: Record<string, File>): void }>();

const enabledRef = ref(props.enabled);

const { dropTargetRef, dropOverlayRef, fileDragEnter } = useDropArea({
  fileDropped: (filesMap) => emit('fileDropped', filesMap),
  targetPath: props.targetPath,
  enabled: enabledRef,
});

watchEffect(() => (enabledRef.value = props.enabled));
watchEffect(() => (dropTargetRef.value = props.dropTarget));
</script>

<style lang="scss" scoped>
@forward './FullPageFileDropZone';
</style>
