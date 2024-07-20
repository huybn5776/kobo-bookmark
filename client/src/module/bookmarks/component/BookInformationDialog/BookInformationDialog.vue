<template>
  <div class="book-information-dialog">
    <div class="book-information-dialog-content">
      <div class="book-information-title">
        <template v-if="!editingTitle">
          <span>{{ props.book.info.title }}</span>
          <IconButton
            class="book-information-title-edit-button"
            i18nKey="common.edit"
            @click="editingTitle = !editingTitle"
          >
            <PencilIcon class="icon-20" />
          </IconButton>
        </template>
        <template v-if="editingTitle">
          <NInput v-model:value="bookTitle" class="book-information-title-input" @keydown="onTitleKeydown" />
          <IconButton class="book-information-title-edit-button" i18nKey="common.cancel" @click="cancelEditTitle">
            <CloseIcon class="icon-20" />
          </IconButton>
          <IconButton class="book-information-title-edit-button" i18nKey="common.edit" @click="saveTitle">
            <CheckIcon class="icon-20" />
          </IconButton>
        </template>
      </div>

      <template v-if="book.info.originalTitle">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.original_title" />
        </label>
        <span>{{ book.info.originalTitle }}</span>
      </template>
      <template v-if="book.info.subtitle">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.subtitle" />
        </label>
        <span>{{ book.info.subtitle }}</span>
      </template>
      <template v-if="book.info.author">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.author" />
        </label>
        <span>{{ book.info.author }}</span>
      </template>
      <template v-if="book.info.series">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.series" />
        </label>
        <span>{{ book.info.series }}</span>
      </template>
      <template v-if="book.info.publisher">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.publisher" />
        </label>
        <span>{{ book.info.publisher }}</span>
      </template>
      <template v-if="publicationDate">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.publication_date" />
        </label>
        <span>{{ publicationDate }}</span>
      </template>
      <template v-if="book.info.isbn">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.isbn" />
        </label>
        <span>{{ book.info.isbn }}</span>
      </template>

      <template v-if="lastReadAt">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.last_read_at" />
        </label>
        <span>{{ lastReadAt }}</span>
      </template>

      <label class="book-info-label">
        <i18n-t keypath="page.bookmarks.book_info.first_bookmark_at" />
      </label>
      <span>{{ firstBookmarkAt }}</span>
      <label class="book-info-label">
        <i18n-t keypath="page.bookmarks.book_info.last_bookmark_at" />
      </label>
      <span>{{ lastBookmarkAt }}</span>
    </div>

    <div class="book-information-dialog-actions">
      <NButton size="small" @click="emit('closeClick')">
        <i18n-t keypath="common.close" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import { NButton, NInput } from 'naive-ui';

import { PencilIcon, CloseIcon, CheckIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBook } from '@/dto/kobo-book';

const props = defineProps<{ book: KoboBook }>();
const emit = defineEmits<{
  (e: 'titleUpdated', title: string): void;
  (e: 'closeClick'): void;
}>();

const bookTitle = ref(props.book.info.title);
const editingTitle = ref<boolean>(false);

const lastReadAt = computed(() => props.book.info.lastReadAt?.toLocaleString());
const publicationDate = computed(() => {
  const date = props.book.info?.publicationDate;
  if (!date) {
    return undefined;
  }
  const datePartString = date.toISOString().split('T')[0];
  return new Date(datePartString).toLocaleDateString();
});
const firstBookmarkAt = computed(() =>
  new Date(Math.min(...props.book.bookmarks.map((b) => b.createdAt.getTime()))).toLocaleString(),
);
const lastBookmarkAt = computed(() =>
  new Date(Math.max(...props.book.bookmarks.map((b) => b.updatedAt.getTime()))).toLocaleString(),
);

function onTitleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    saveTitle();
  } else if (event.key === 'Escape') {
    cancelEditTitle();
    event.stopPropagation();
  }
}

function cancelEditTitle(): void {
  editingTitle.value = false;
  bookTitle.value = props.book.info.title;
}

function saveTitle(): void {
  editingTitle.value = false;
  if (bookTitle.value && bookTitle.value !== props.book.info.title) {
    emit('titleUpdated', bookTitle.value);
  }
}
</script>

<style lang="scss" scoped>
@import './BookInformationDialog';
</style>
