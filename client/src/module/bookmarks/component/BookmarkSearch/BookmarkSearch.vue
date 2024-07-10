<template>
  <div ref="elementRef" class="bookmark-search">
    <NInput
      ref="inputRef"
      v-model:value="searchModel"
      clearable
      :placeholder="placeholder"
      @focus="showModel = true"
      @keydown="showModel = true"
    />
    <div v-if="showModel" class="bookmark-search-dropdown-container">
      <NVirtualList ref="virtualListRef" :itemSize="34" :items="filteredOptions" class="bookmark-search-dropdown">
        <!--suppress VueUnrecognizedSlot -->
        <template #default="{ item: option }">
          <div class="bookmark-search-option-container">
            <template v-if="option.type === 'group'">
              <div class="bookmark-search-option bookmark-search-group-option">
                <span class="bookmark-search-option-text bookmark-search-group-option-text">{{ option.label }}</span>
              </div>
            </template>
            <template v-if="option.type !== 'group'">
              <div
                class="bookmark-search-option bookmark-search-child-option"
                :class="{ 'bookmark-search-child-option-pending': option.bookmark.id === pendingOption?.bookmark.id }"
                @click="onSelect(option)"
                @mouseover="onOptionHover(option)"
              >
                <span class="bookmark-search-option-text bookmark-search-child-option-text">
                  <HighlightText :text="option.label" :search="searchModel" />
                </span>
              </div>
            </template>
          </div>
        </template>
      </NVirtualList>

      <div v-if="!filteredOptions.length" class="bookmark-search-option bookmark-search-empty-option">
        <span class="bookmark-search-empty-option-text"><i18n-t keypath="common.no_matched" /></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref, watch } from 'vue';

import { useEventListener, onClickOutside } from '@vueuse/core';
import { NInput, SelectGroupOption, NVirtualList } from 'naive-ui';
import { SelectBaseOption } from 'naive-ui/es/select/src/interface';
import { useI18n } from 'vue-i18n';

import HighlightText from '@/component/HighlightText/HighlightText.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { highlightSyntax } from '@/const/consts';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';

const props = defineProps<{ books: KoboBook[] }>();
const emits = defineEmits<{
  (e: 'selected', book: KoboBook, bookmark: KoboBookmark): void;
}>();
const showModel = defineModel<boolean>('show', { default: false });
const searchModel = defineModel<string>('search');

type BookmarkSearchOption = SelectBaseOption & { book: KoboBook; bookmark: KoboBookmark };

const { t } = useI18n<[I18NMessageSchema]>();
const elementRef = ref<HTMLElement>();
const pendingOption = ref<BookmarkSearchOption>();
const inputRef = ref<InstanceType<typeof NInput>>();
const virtualListRef = ref<InstanceType<typeof NVirtualList>>();
const options: Ref<SelectGroupOption[]> = computed(() => {
  return props.books.map((book) => {
    return {
      type: 'group',
      label: book.info.title,
      key: book.id,
      children: book.bookmarks.map((bookmark) => {
        const option: SelectBaseOption = {
          key: bookmark.id,
          value: bookmark.id,
          label: bookmark.text.replaceAll(highlightSyntax, ''),
          book,
          bookmark,
        };
        return option;
      }),
    };
  });
});
const filteredOptions = computed<(SelectGroupOption | BookmarkSearchOption)[]>(() => {
  const text = searchModel.value?.toLowerCase();
  if (!text) {
    return options.value.flatMap((groupOption) => [
      groupOption as SelectGroupOption,
      ...((groupOption.children as BookmarkSearchOption[]) || []),
    ]);
  }
  return options.value.flatMap((groupOption) => {
    const children = (groupOption.children || []).filter((option) =>
      (option.label as string).toLowerCase().includes(text),
    ) as BookmarkSearchOption[];
    if (!children.length) {
      return [] as BookmarkSearchOption[];
    }
    return [groupOption, ...children];
  });
});
const filteredChildOptions = computed<BookmarkSearchOption[]>(
  () => filteredOptions.value.filter((option) => option.type !== 'group') as BookmarkSearchOption[],
);

const placeholder = computed(() => {
  const searchText = t('common.search');
  const hotkey = navigator.userAgent.includes('Mac') ? '⌘K' : 'Ctrl-K';
  return `${searchText} (${hotkey})`;
});

useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.code === 'KeyK') {
    showModel.value = true;
    event.preventDefault();
    inputRef.value?.focus();
    return;
  }
  if (!showModel.value) {
    return;
  }
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.code === 'Escape') {
    closeModal();
  } else if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.code === 'ArrowDown') {
    movePendingOption(1);
    event.preventDefault();
  } else if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.code === 'ArrowUp') {
    movePendingOption(-1);
    event.preventDefault();
  } else if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.key === 'Enter') {
    onSelect(pendingOption.value);
  }
});
onClickOutside(elementRef, () => setTimeout(closeModal));

watch(
  () => filteredChildOptions.value,
  () => ([pendingOption.value] = filteredChildOptions.value),
);

function movePendingOption(offset: number): void {
  if (!pendingOption.value) {
    [pendingOption.value] = filteredChildOptions.value;
    return;
  }
  const currentPendingIndex = filteredChildOptions.value.findIndex(
    (option) => option.bookmark.id === pendingOption.value?.bookmark.id,
  );
  const newIndex = Math.max(0, Math.min(filteredChildOptions.value.length - 1, currentPendingIndex + offset));
  pendingOption.value = filteredChildOptions.value[newIndex];
  scrollToOption(pendingOption.value);
}

function scrollToOption(option?: BookmarkSearchOption): void {
  if (option) {
    virtualListRef.value?.scrollTo({ key: option.bookmark.id });
  }
}

function onOptionHover(option: BookmarkSearchOption): void {
  pendingOption.value = option;
}

function onSelect(option?: BookmarkSearchOption): void {
  if (option) {
    emits('selected', option.book, option.bookmark);
  }
}

function closeModal(): void {
  showModel.value = false;
  pendingOption.value = undefined;
}
</script>

<style lang="scss" scoped>
@import './BookmarkSearch';
</style>
