<template>
  <div class="book-export-progress-modal">
    <header class="book-export-progress-modal-header">
      <span>Exporting books</span>
      <ChevronArrow
        class="book-export-collapse-button"
        :direction="collapsed ? 'up' : 'down'"
        @update:direction="(e) => (collapsed = e === 'up')"
      />
    </header>

    <div v-if="!collapsed" class="book-export-progress-modal-content">
      <BookTaskItem v-for="task of tasksToShow" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import { BookExportTask } from '@/interface/book-export-task';
import BookTaskItem from '@/module/bookmarks/components/BookTaskItem/BookTaskItem.vue';

const props = defineProps<{ tasks: BookExportTask[] }>();

const collapsed = ref(false);
const tasksToShow = computed(() => props.tasks.toReversed());
</script>

<style lang="scss" scoped>
@import './BookExportProgressModal';
</style>
