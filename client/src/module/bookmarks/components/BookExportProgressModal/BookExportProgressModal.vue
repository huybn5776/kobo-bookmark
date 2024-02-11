<template>
  <div class="book-export-progress-modal">
    <header class="book-export-progress-modal-header">
      <span>Exporting books</span>
      <ChevronArrow
        class="book-export-collapse-button"
        :direction="collapsed ? 'up' : 'down'"
        @update:direction="(e) => (collapsed = e === 'up')"
      />
      <NButton class="book-export-close-button" quaternary circle @click="cancelAllTask">Close</NButton>
    </header>

    <div v-if="!collapsed" class="book-export-progress-modal-content">
      <BookTaskItem v-for="task of tasks" :key="task.id" :task="task" @cancel="emits('cancelTask', task)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { NButton } from 'naive-ui';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import { BookExportTask } from '@/interface/book-export-task';
import BookTaskItem from '@/module/bookmarks/components/BookTaskItem/BookTaskItem.vue';

defineProps<{ tasks: BookExportTask[] }>();
const emits = defineEmits<{ (e: 'cancelTask', value: BookExportTask): void; (e: 'cancelAllTask'): void }>();

const collapsed = ref(false);

function cancelAllTask() {
  emits('cancelAllTask');
  collapsed.value = true;
}
</script>

<style lang="scss" scoped>
@import './BookExportProgressModal';
</style>
