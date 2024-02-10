<template>
  <div class="book-export-progress-modal">
    <header class="book-export-progress-modal-header">
      <span>Exporting books</span>
    </header>

    <div class="book-export-progress-modal-content">
      <BookTaskItem v-for="task of tasksToShow" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { BookExportTask } from '@/interface/book-export-task';
import BookTaskItem from '@/module/bookmarks/components/BookTaskItem/BookTaskItem.vue';

const props = defineProps<{ tasks: BookExportTask[] }>();

const tasksToShow = computed(() => props.tasks.toReversed());
</script>

<style lang="scss" scoped>
@import './BookExportProgressModal';
</style>
