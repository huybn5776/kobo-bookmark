<template>
  <div ref="elementRef" class="book-search-modal">
    <input ref="searchInput" v-model="searchValue" class="book-modal-search-input" :placeholder="t('common.search')" />
    <NVirtualList ref="virtualListRef" keyField="id" :itemSize="itemSize" :items="filteredBooks">
      <!--suppress VueUnrecognizedSlot -->
      <template #default="{ item: book, index }">
        <div
          class="book-modal-item"
          :class="{ 'book-modal-item-pending': index === pendingBookIndex }"
          @click="selectBook($event, book)"
          @mousemove="pendingBookIndex = index"
        >
          <img class="book-modal-cover" :src="book.coverImageUrl" :alt="book.info.title" />
          <span class="book-modal-title">{{ book.info.title }}</span>
        </div>
      </template>
    </NVirtualList>
    <span class="book-modal-instruction">
      <i18n-t keypath="page.bookmarks.book_search_instruction">
        <kbd class="book-modal-hotkey">Enter</kbd>
        <kbd class="book-modal-hotkey">{{ ctrlOrCmd }}Enter</kbd>
      </i18n-t>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref, ComponentInstance, onMounted, computed, watch } from 'vue';

import { useEventListener, onClickOutside } from '@vueuse/core';
import { NVirtualList } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';

const itemSize = 36;

const props = defineProps<{ books: KoboBook[] }>();
const emits = defineEmits<{
  (e: 'select', value: KoboBook): void;
  (e: 'alterSelect', value: KoboBook): void;
  (e: 'close'): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const ctrlOrCmd = navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl-';

const elementRef = ref<HTMLElement>();
const searchInput = ref<HTMLInputElement>();
const virtualListRef = ref<ComponentInstance<typeof NVirtualList>>();

const searchValue = ref<string>('');
const pendingBookIndex = ref<number>(0);
const lastPendingBook = ref<KoboBook>();

const filteredBooks = computed(() => {
  if (!searchValue.value) {
    return props.books;
  }
  const search = searchValue.value.toLowerCase();
  return props.books.filter((book) => book.info.title?.toLowerCase().includes(search));
});

onMounted(() => searchInput.value?.focus());
onClickOutside(elementRef, () => emits('close'));

watch(
  () => pendingBookIndex.value,
  () => (lastPendingBook.value = filteredBooks.value[pendingBookIndex.value]),
);
watch(
  () => filteredBooks.value,
  () => {
    const lastBook = lastPendingBook.value;
    if (!lastBook) {
      return;
    }
    const newIndex = filteredBooks.value.indexOf(lastBook);
    pendingBookIndex.value = newIndex === -1 ? 0 : newIndex;
  },
);

useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (event.code === 'ArrowUp') {
    moveCursor(-1);
    event.preventDefault();
  } else if (event.code === 'ArrowDown') {
    moveCursor(1);
    event.preventDefault();
  } else if (event.key === 'Enter') {
    const book = filteredBooks.value[pendingBookIndex.value];
    if (book) {
      selectBook(event, book);
    }
  } else if (event.key === 'PageDown') {
    moveCursor(getViewportItemsSize());
  } else if (event.key === 'PageUp') {
    moveCursor(-getViewportItemsSize());
  }
});

function moveCursor(cursorOffset: number): void {
  const targetIndex = pendingBookIndex.value + cursorOffset;
  pendingBookIndex.value = Math.max(0, Math.min(filteredBooks.value.length - 1, targetIndex));
  virtualListRef.value?.scrollTo({ index: pendingBookIndex.value });
}

function selectBook(event: KeyboardEvent | MouseEvent, book: KoboBook): void {
  if (event.ctrlKey || event.metaKey) {
    emits('alterSelect', book);
  } else {
    emits('select', book);
  }
}

function getViewportItemsSize(): number {
  return Math.floor((virtualListRef.value?.$el?.offsetHeight ?? 0) / itemSize) - 1;
}
</script>

<style lang="scss" scoped>
@import './BookSearchModal';
</style>
