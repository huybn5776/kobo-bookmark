<template>
  <div class="book-export-progress-modal">
    <header class="book-export-progress-modal-header">
      <span>{{ title }}</span>
      <ChevronArrow
        class="book-export-collapse-button"
        :direction="collapsed ? 'up' : 'down'"
        @update:direction="(e) => (collapsed = e === 'up')"
      />
      <NButton class="book-export-close-button" quaternary circle @click="discardAllTasks">Close</NButton>
    </header>

    <div v-if="runningTask && progressMessage" class="book-export-progress-current-state">
      <span class="book-export-progress-message">{{ progressMessage }}</span>
      <NButton secondary @click="emits('cancelTask', runningTask)">Cancel</NButton>
    </div>

    <div v-if="!collapsed" class="book-export-progress-modal-content">
      <BookTaskItem
        v-for="task of tasks"
        :key="task.id"
        :task="task"
        @click="emits('taskClick', task)"
        @cancel="emits('cancelTask', task)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { NButton } from 'naive-ui';
import { groupBy, isNotNil } from 'ramda';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import { BookExportTask, BookExportState, BookExportStage } from '@/interface/book-export-task';
import BookTaskItem from '@/module/bookmarks/components/BookTaskItem/BookTaskItem.vue';

const props = defineProps<{ tasks: BookExportTask[] }>();
const emits = defineEmits<{
  (e: 'taskClick', value: BookExportTask): void;
  (e: 'cancelTask', value: BookExportTask): void;
  (e: 'discardAllTasks'): void;
}>();

const collapsed = ref(false);

const title = computed<string>(() => {
  const taskStateGrouping = groupBy((task) => task.state, props.tasks);
  const ongoingTasksCount =
    (taskStateGrouping[BookExportState.Pending]?.length ?? 0) +
    (taskStateGrouping[BookExportState.Running]?.length ?? 0);
  if (ongoingTasksCount) {
    return `Exporting ${ongoingTasksCount} books`;
  }
  const succeededTasksCount = taskStateGrouping[BookExportState.Succeeded]?.length ?? 0;
  if (succeededTasksCount) {
    return `${succeededTasksCount} books exported`;
  }
  const failedTasksCount = taskStateGrouping[BookExportState.Failed]?.length ?? 0;
  if (failedTasksCount) {
    return `${failedTasksCount} books failed`;
  }
  const canceledTasksCount = taskStateGrouping[BookExportState.Canceled]?.length ?? 0;
  if (canceledTasksCount) {
    return `${canceledTasksCount} books canceled`;
  }
  return `${props.tasks.length} book completed`;
});

const runningTask = computed(() => props.tasks.find((t) => t.state === BookExportState.Running));
const progressMessage = computed(() => {
  if (!runningTask.value) {
    return undefined;
  }
  return taskToMessage(runningTask.value);
});

const stageToText: Record<BookExportStage, string> = {
  [BookExportStage.CheckingTargetPage]: 'Checking target page',
  [BookExportStage.CreatePage]: 'Creating page',
  [BookExportStage.UpdatePage]: 'Updating page',
  [BookExportStage.AddBlocks]: 'Adding blocks',
  [BookExportStage.CleanupPage]: 'Cleanup page',
};

function taskToMessage(task: BookExportTask): string {
  const { percentage, step, totalStep, stage } = task;
  if (!stage) {
    return 'Starting...';
  }
  const stepText = isNotNil(step) && isNotNil(totalStep) ? `${step + 1}/${totalStep} - ` : '';
  const stageText = stageToText[stage];
  const percentageText = isNotNil(percentage) ? ` ${Math.round(percentage)}%` : '';
  return `${stepText}${stageText}${percentageText}`;
}

function discardAllTasks() {
  emits('discardAllTasks');
  collapsed.value = true;
}
</script>

<style lang="scss" scoped>
@import './BookExportProgressModal';
</style>
