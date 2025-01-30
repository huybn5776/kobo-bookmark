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
            <Icon name="pencil" class="icon-20" />
          </IconButton>
        </template>
        <template v-if="editingTitle">
          <NInput v-model:value="bookTitle" class="book-information-title-input" @keydown="onTitleKeydown" />
          <IconButton class="book-information-title-edit-button" i18nKey="common.cancel" @click="cancelEditTitle">
            <Icon name="close" class="icon-20" />
          </IconButton>
          <IconButton class="book-information-title-edit-button" i18nKey="common.edit" @click="saveTitle">
            <Icon name="check" class="icon-20" />
          </IconButton>
        </template>
      </div>

      <template v-if="book.info.originalTitle">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.original_title" />
        </span>
        <span>{{ book.info.originalTitle }}</span>
      </template>
      <template v-if="book.info.subtitle">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.subtitle" />
        </span>
        <span>{{ book.info.subtitle }}</span>
      </template>
      <template v-if="book.info.author">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.author" />
        </span>
        <span>{{ book.info.author }}</span>
      </template>
      <template v-if="book.info.series">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.series" />
        </span>
        <span>{{ book.info.series }}</span>
      </template>
      <template v-if="book.info.publisher">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.publisher" />
        </span>
        <span>{{ book.info.publisher }}</span>
      </template>
      <template v-if="publicationDate">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.publication_date" />
        </span>
        <span>{{ publicationDate }}</span>
      </template>
      <template v-if="book.info.isbn">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.isbn" />
        </span>
        <span>{{ book.info.isbn }}</span>
      </template>

      <template v-if="lastReadAt">
        <span class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.last_read_at" />
        </span>
        <span>{{ lastReadAt }}</span>
      </template>

      <span class="book-info-label">
        <i18n-t keypath="page.bookmarks.book_info.first_bookmark_at" />
      </span>
      <span>{{ firstBookmarkAt }}</span>
      <span class="book-info-label">
        <i18n-t keypath="page.bookmarks.book_info.last_bookmark_at" />
      </span>
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

import Icon from '@/component/icon/Icon.vue';
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
  const date = props.book.info.publicationDate;
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
