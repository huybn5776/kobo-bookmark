<template>
  <button
    class="book-export-item"
    :class="{ 'book-export-item-canceled': task.state === BookExportState.Canceled }"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
    @focusin="hovered = true"
    @focusout="hovered = false"
  >
    <BookCoverIconView :src="task.book.coverImageUrl" :title="task.book.info.title" />
    <span class="book-export-item-name">{{ task.book.info.title }}</span>

    <Icon v-if="task.state === BookExportState.Canceled" name="cancel" class="icon-24" />
    <NButton
      v-else-if="hovered && (task.state === BookExportState.Running || task.state === BookExportState.Pending)"
      class="book-export-item-cancel-button"
      quaternary
      circle
      @click="onCancelClick"
    >
      <Icon name="close-circle" class="icon-24" />
      Cancel
    </NButton>
    <NProgress
      v-else
      class="book-export-item-progress"
      type="circle"
      :status="status"
      :percentage="percentage"
      :showIndicator="showIndicator"
      :strokeWidth="24"
    />
  </button>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import { NProgress, NButton, ProgressStatus } from 'naive-ui';
import { isNotNil } from 'ramda';

import BookCoverIconView from '@/component/BookCoverIconView/BookCoverIconView.vue';
import Icon from '@/component/icon/Icon.vue';
import { BookExportTask, BookExportState } from '@/interface/book-export-task';

const props = defineProps<{ task: BookExportTask }>();
const emit = defineEmits<{ (e: 'cancel'): void }>();

const hovered = ref(false);

const percentage = computed(() => {
  const { task } = props;
  switch (task.state) {
    case BookExportState.Pending:
      return 0;
    case BookExportState.Running: {
      let percentageValue = task.percentage ?? 0;
      if (isNotNil(task.step) && isNotNil(task.totalStep)) {
        const basePercentage = (task.step / task.totalStep) * 100;
        percentageValue = basePercentage + percentageValue / task.totalStep;
      }
      return Math.max(1, percentageValue);
    }
    case BookExportState.Succeeded:
    case BookExportState.Failed:
    case BookExportState.Canceled:
      return 100;
    default:
      return task.percentage;
  }
});

const status = computed<ProgressStatus | undefined>(() => {
  const { task } = props;
  switch (task.state) {
    case BookExportState.Succeeded:
      return 'success';
    case BookExportState.Failed:
      return 'error';
    default:
      return undefined;
  }
});

const showIndicator = computed(() => {
  return props.task.state === BookExportState.Succeeded || props.task.state === BookExportState.Failed;
});

function onCancelClick(event: MouseEvent): void {
  event.stopPropagation();
  emit('cancel');
}
</script>

<style lang="scss" scoped>
@forward './BookTaskItem';
</style>
