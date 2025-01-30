<template>
  <div class="book-export-progress-modal">
    <header class="book-export-progress-modal-header">
      <span>{{ title }}</span>
      <ChevronArrow
        class="book-export-collapse-button"
        :direction="collapsed ? 'up' : 'down'"
        @update:direction="(e) => (collapsed = e === 'up')"
      />
      <NButton class="book-export-close-button" quaternary circle @click="discardAllTasks">
        <Icon name="close" class="book-export-close-button-icon" />
        Close
      </NButton>
    </header>

    <div v-if="runningTask && progressMessage" class="book-export-progress-current-state">
      <span class="book-export-progress-message">{{ progressMessage }}</span>
      <NButton secondary @click="emit('cancelTask', runningTask)">Cancel</NButton>
    </div>

    <div v-if="!collapsed" class="book-export-progress-modal-content">
      <BookTaskItem
        v-for="task of tasks"
        :key="task.id"
        :task="task"
        @click="emit('taskClick', task)"
        @cancel="emit('cancelTask', task)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { NButton } from 'naive-ui';
import { groupBy, isNotNil } from 'ramda';
import { useI18n } from 'vue-i18n';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import Icon from '@/component/icon/Icon.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookExportTask, BookExportState, BookExportStage } from '@/interface/book-export-task';
import BookTaskItem from '@/module/bookmarks/component/BookTaskItem/BookTaskItem.vue';

const props = defineProps<{ tasks: BookExportTask[] }>();
const emit = defineEmits<{
  (e: 'taskClick', value: BookExportTask): void;
  (e: 'cancelTask', value: BookExportTask): void;
  (e: 'discardAllTasks'): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const collapsed = ref(false);

const title = computed<string>(() => {
  const taskStateGrouping = groupBy((task) => task.state, props.tasks);
  const ongoingTasksCount =
    (taskStateGrouping[BookExportState.Pending]?.length ?? 0) +
    (taskStateGrouping[BookExportState.Running]?.length ?? 0);
  if (ongoingTasksCount) {
    return t('page.bookmarks.exporting_books', [ongoingTasksCount], ongoingTasksCount);
  }
  const succeededTasksCount = taskStateGrouping[BookExportState.Succeeded]?.length ?? 0;
  if (succeededTasksCount) {
    return t('page.bookmarks.book_exported', [succeededTasksCount], succeededTasksCount);
  }
  const failedTasksCount = taskStateGrouping[BookExportState.Failed]?.length ?? 0;
  if (failedTasksCount) {
    return t('page.bookmarks.book_failed', [failedTasksCount], failedTasksCount);
  }
  const canceledTasksCount = taskStateGrouping[BookExportState.Canceled]?.length ?? 0;
  if (canceledTasksCount) {
    return t('page.bookmarks.book_canceled', [canceledTasksCount], canceledTasksCount);
  }
  const completedCount = props.tasks.length;
  return t('page.bookmarks.book_completed', [completedCount], completedCount);
});

const runningTask = computed(() => props.tasks.find((task) => task.state === BookExportState.Running));
const progressMessage = computed(() => {
  if (!runningTask.value) {
    return undefined;
  }
  return taskToMessage(runningTask.value);
});

const stageToText: Record<BookExportStage, string> = {
  [BookExportStage.CheckingTargetPage]: t('page.bookmarks.checking_target_page'),
  [BookExportStage.CreatePage]: t('page.bookmarks.creating_page'),
  [BookExportStage.UpdatePage]: t('page.bookmarks.updating_page'),
  [BookExportStage.AddBlocks]: t('page.bookmarks.adding_blocks'),
  [BookExportStage.CleanupPage]: t('page.bookmarks.cleanup_page'),
};

function taskToMessage(task: BookExportTask): string {
  const { percentage, step, totalStep, stage } = task;
  if (!stage) {
    return t('page.bookmarks.starting');
  }
  const stepText = isNotNil(step) && isNotNil(totalStep) ? `${step + 1}/${totalStep} - ` : '';
  const stageText = stageToText[stage];
  const percentageText = isNotNil(percentage) ? ` ${Math.round(percentage)}%` : '';
  return `${stepText}${stageText}${percentageText}`;
}

function discardAllTasks(): void {
  emit('discardAllTasks');
  collapsed.value = true;
}
</script>

<style lang="scss" scoped>
@forward './BookExportProgressModal';
</style>
