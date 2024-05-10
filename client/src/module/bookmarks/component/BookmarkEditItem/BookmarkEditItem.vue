<template>
  <div class="bookmark-edit-item">
    <BookmarkChapterView :chapter="bookmark.chapter" />
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
        <RestoreIcon class="bookmark-edit-action-icon" />
      </IconButton>
      <HighlightColorDropdown v-model:color="color" />
      <IconButton i18nKey="common.cancel" @click="emits('cancel')">
        <CloseIcon class="bookmark-edit-action-icon" />
      </IconButton>
      <IconButton i18nKey="common.save" @click="completeEditing">
        <CheckIcon class="bookmark-edit-action-icon" />
      </IconButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { useEventListener } from '@vueuse/core';
import { NInput } from 'naive-ui';

import { RestoreIcon, CloseIcon, CheckIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { highlightSyntax } from '@/const/consts';
import { KoboBookmark } from '@/dto/kobo-book';
import BookmarkChapterView from '@/module/bookmarks/component/BookmarkChapterView/BookmarkChapterView.vue';
import BookmarkEditInstructionButton from '@/module/bookmarks/component/BookmarkEditInstructionButton/BookmarkEditInstructionButton.vue';
import HighlightColorDropdown from '@/module/bookmarks/component/HighlightColorDropdown/HighlightColorDropdown.vue';
import { toggleSyntax } from '@/util/text-syntax-utils';

const props = defineProps<{ bookmark: KoboBookmark }>();
const emits = defineEmits<{
  (e: 'revert'): void;
  (e: 'cancel'): void;
  (e: 'save', bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): void;
}>();

useEventListener(document, 'keydown', onDocumentKeyDown);

const inputRef = ref<InstanceType<typeof NInput>>();
const text = ref(props.bookmark.text);
const color = ref(props.bookmark.color);

const canRestoreBookmarkText = computed(
  () =>
    (props.bookmark.originalText && text.value !== props.bookmark.originalText) ||
    (!props.bookmark.originalText && text.value !== props.bookmark.text),
);

function onDocumentKeyDown(event: KeyboardEvent): void {
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.key === 'Escape') {
    emits('cancel');
  }
}

function onInputKeyDown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key === 'Enter') {
    completeEditing();
  } else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.code === 'KeyB') {
    const selection = getSelection();
    event.preventDefault();
    text.value = toggleSyntax(text.value, highlightSyntax, selection.start, selection.end);
    setTimeout(() => setSelection(selection.start));
  }
}

function getSelection(): { start: number; end: number } {
  const textareaElement = inputRef.value?.textareaElRef as HTMLTextAreaElement;
  const { selectionStart, selectionEnd } = textareaElement;
  return { start: selectionStart, end: selectionEnd };
}

function setSelection(start: number, end?: number): void {
  const textareaElement = inputRef.value?.textareaElRef as HTMLTextAreaElement;
  textareaElement.selectionStart = start;
  textareaElement.selectionEnd = start ?? end;
}

function revertBookmarkText(): void {
  text.value = props.bookmark.originalText || props.bookmark.text;
}

function completeEditing(): void {
  const changes: Partial<KoboBookmark> = {};
  if (text.value !== props.bookmark.text) {
    changes.text = text.value;
  }
  if (color.value !== props.bookmark.color) {
    changes.color = color.value;
  }
  if (Object.keys(changes)) {
    emits('save', props.bookmark.id, changes);
  } else {
    emits('cancel');
  }
}
</script>

<style lang="scss" scoped>
@import './BookmarkEditItem';
</style>
