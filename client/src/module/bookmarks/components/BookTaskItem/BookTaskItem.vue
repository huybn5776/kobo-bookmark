<template>
  <div class="book-export-item">
    <img class="book-export-item-image" :src="task.book.coverImageUrl" :alt="task.book.info.title" />
    <span class="book-export-item-name">{{ task.book.info.title }}</span>
    <NProgress
      class="book-export-item-progress"
      type="circle"
      :status="status"
      :percentage="percentage"
      :showIndicator="showIndicator"
      :strokeWidth="24"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NProgress } from 'naive-ui';
import type { Status } from 'naive-ui/es/progress/src/interface';
import { isNotNil } from 'ramda';

import { BookExportTask, BookExportState } from '@/interface/book-export-task';

const props = defineProps<{ task: BookExportTask }>();

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

const status = computed<Status | undefined>(() => {
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
</script>

<style lang="scss" scoped>
@import './BookTaskItem';
</style>
