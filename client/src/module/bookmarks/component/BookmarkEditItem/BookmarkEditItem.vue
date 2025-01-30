<template>
  <div
    class="bookmark-edit-item"
    :class="{ 'bookmark-edit-item-no-chapter': !bookmark.chapter.relatedChapterIndexes.length }"
  >
    <BookmarkChapterEdit v-model:chapter="chapter" :allChapters="book.chapters" :chapterIndexMap="chapterIndexMap" />
    <NInput
      ref="inputRef"
      v-model:value="text"
      class="bookmark-edit-textarea"
      type="textarea"
      autosize
      @keydown="onInputKeyDown"
    />

    <div class="bookmark-edit-toolbar">
      <BookmarkEditInstructionButton />
      <IconButton
        i18nKey="page.bookmarks.revert_highlight"
        :disabled="!canRestoreBookmarkText"
        @click="revertBookmarkText"
      >
        <Icon name="restore" class="bookmark-edit-action-icon" />
      </IconButton>
      <HighlightColorDropdown v-model:color="color" />
      <IconButton i18nKey="common.cancel" @click="emit('cancel')">
        <Icon name="close" class="bookmark-edit-action-icon" />
      </IconButton>
      <IconButton i18nKey="common.save" @click="completeEditing">
        <Icon name="check" class="bookmark-edit-action-icon" />
      </IconButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue';

import { useEventListener } from '@vueuse/core';
import { NInput } from 'naive-ui';

import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { highlightSyntax } from '@/const/consts';
import { KoboBookmark, KoboBookChapter, KoboBook } from '@/dto/kobo-book';
import BookmarkChapterEdit from '@/module/bookmarks/component/BookmarkChapterEdit/BookmarkChapterEdit.vue';
import BookmarkEditInstructionButton from '@/module/bookmarks/component/BookmarkEditInstructionButton/BookmarkEditInstructionButton.vue';
import HighlightColorDropdown from '@/module/bookmarks/component/HighlightColorDropdown/HighlightColorDropdown.vue';
import { toggleSyntax } from '@/util/text-syntax-utils';

const props = defineProps<{
  book: KoboBook;
  chapterIndexMap: Record<number, KoboBookChapter>;
  bookmark: KoboBookmark;
}>();
const emit = defineEmits<{
  (e: 'revert'): void;
  (e: 'cancel'): void;
  (e: 'save', bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): void;
}>();

useEventListener(document, 'keydown', onDocumentKeyDown);

const chapter = ref(props.bookmark.chapter);
const inputRef = ref<InstanceType<typeof NInput>>();
const text = ref(props.bookmark.text);
const color = ref(props.bookmark.color);

const canRestoreBookmarkText = computed(
  () =>
    (props.bookmark.originalChapter && chapter.value !== props.bookmark.originalChapter) ||
    (!props.bookmark.originalChapter && chapter.value !== props.bookmark.chapter) ||
    (props.bookmark.originalText && text.value !== props.bookmark.originalText) ||
    (!props.bookmark.originalText && text.value !== props.bookmark.text),
);

function onDocumentKeyDown(event: KeyboardEvent): void {
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.key === 'Escape') {
    emit('cancel');
  }
}

function onInputKeyDown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key === 'Enter') {
    completeEditing();
  } else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.code === 'KeyB') {
    const selection = getSelection();
    event.preventDefault();
    text.value = toggleSyntax(text.value, highlightSyntax, selection.start, selection.end);
    nextTick(() => setSelection(selection.start));
  }
}

function getSelection(): { start: number; end: number } {
  const textareaElement = inputRef.value?.textareaElRef;
  if (!textareaElement) {
    return { start: 0, end: 0 };
  }
  const { selectionStart, selectionEnd } = textareaElement;
  return { start: selectionStart, end: selectionEnd };
}

function setSelection(start: number, end?: number): void {
  const textareaElement = inputRef.value?.textareaElRef;
  if (!textareaElement) {
    return;
  }
  textareaElement.selectionStart = start;
  textareaElement.selectionEnd = start ?? end;
}

function revertBookmarkText(): void {
  chapter.value = props.bookmark.originalChapter ?? props.bookmark.chapter;
  text.value = props.bookmark.originalText || props.bookmark.text;
}

function completeEditing(): void {
  const changes: Partial<KoboBookmark> = {};
  if (chapter.value !== props.bookmark.chapter) {
    changes.chapter = chapter.value;
  }
  if (text.value !== props.bookmark.text) {
    changes.text = text.value;
  }
  if (color.value !== props.bookmark.color) {
    changes.color = color.value;
  }
  if (Object.keys(changes)) {
    emit('save', props.bookmark.id, changes);
  } else {
    emit('cancel');
  }
}
</script>

<style lang="scss" scoped>
@forward './BookmarkEditItem';
</style>
