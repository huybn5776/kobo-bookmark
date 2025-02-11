<template>
  <div
    ref="elementRef"
    class="bookmark-item"
    :class="{ 'bookmark-item-focused': highlightItem, 'bookmark-item-no-chapter': !showChapter }"
    @animationend="highlightItem = false"
  >
    <BookmarkChapterView
      :showChapterContent="showChapter"
      :chapterIndexMap="chapterIndexMap"
      :chapter="bookmark.chapter"
      :archived="bookmark.isArchived"
    >
      <BookmarkDropdownMenu
        class="bookmark-chapter-dropdown-menu"
        @createCardClick="emit('createCardClick')"
        @archiveClick="emit('archiveClick')"
      />
    </BookmarkChapterView>
    <p class="bookmark-text" :class="{ 'bookmark-text-new': isNew, 'bookmark-text-archived': bookmark.isArchived }">
      <span
        :class="{
          'bookmark-text-yellow': bookmark.color === HighlightColor.Yellow,
          'bookmark-text-red': bookmark.color === HighlightColor.Red,
          'bookmark-text-green': bookmark.color === HighlightColor.Green,
          'bookmark-text-blue': bookmark.color === HighlightColor.Blue,
          'bookmark-text-pink': bookmark.color === HighlightColor.Pink,
          'bookmark-text-purple': bookmark.color === HighlightColor.Purple,
        }"
      >
        <HighlightText :text="bookmark.text" :search="search" />
      </span>
    </p>
    <blockquote v-if="bookmark.annotation" class="bookmark-annotation">
      {{ bookmark.annotation }}
    </blockquote>

    <div class="bookmark-footer">
      <TagsBar
        :bookmark="bookmark"
        :editing="editingTag"
        :readonly="!actions.edit"
        :tagClickable="tagClickable"
        :removable="tagRemovable"
        @tagClick="emit('tagClick', $event)"
        @tagUpdated="emit('tagUpdated', $event)"
        @finish="emit('finishEditingTag')"
      />
      <div class="bookmark-toolbar">
        <IconButton v-if="!bookmark.isArchived && actions.archive" i18nKey="common.tag" @click="emit('tagEditClick')">
          <Icon name="tag" class="bookmark-action-icon" />
        </IconButton>
        <IconButton v-if="actions['edit']" i18nKey="common.edit" @click="emit('editClick')">
          <Icon name="pencil" class="bookmark-action-icon" />
        </IconButton>

        <template v-if="bookmark.isArchived">
          <span class="bookmark-state-text">(<i18n-t keypath="common.archived" />)</span>
          <IconButton v-if="actions.archive" i18nKey="common.cancel_archive" @click="emit('cancelArchiveClick')">
            <Icon name="archive-refresh" class="bookmark-action-icon" />
          </IconButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import HighlightText from '@/component/HighlightText/HighlightText.vue';
import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { newBookmarkTime } from '@/const/consts';
import { KoboBookmark, KoboBookChapter, KoboBookmarkTag } from '@/dto/kobo-book';
import { BookmarkAction } from '@/enum/bookmark-action';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import BookmarkChapterView from '@/module/bookmarks/component/BookmarkChapterView/BookmarkChapterView.vue';
import BookmarkDropdownMenu from '@/module/bookmarks/component/BookmarkDropdownMenu/BookmarkDropdownMenu.vue';
import TagsBar from '@/module/bookmarks/component/TagsBar/TagsBar.vue';

const props = defineProps<{
  chapterIndexMap: Record<number, KoboBookChapter>;
  bookmark: KoboBookmark;
  showChapter: boolean;
  search?: string;
  editingTag: boolean;
  enabledActions?: BookmarkAction[];
  tagRemovable?: boolean;
  tagClickable?: boolean;
}>();
const emit = defineEmits<{
  (e: 'editClick'): void;
  (e: 'createCardClick'): void;
  (e: 'archiveClick'): void;
  (e: 'cancelArchiveClick'): void;
  (e: 'tagClick', value: string): void;
  (e: 'tagEditClick'): void;
  (e: 'tagUpdated', value: KoboBookmarkTag[]): void;
  (e: 'finishEditingTag'): void;
  (e: 'highlightAnimationEnd'): void;
}>();
const elementRef = ref<HTMLElement>();
defineExpose({ elementRef, runHighlightAnimationWhenVisible });

const lastImportState = useSyncSetting(SettingKey.LastImportState);

const highlightItem = ref<boolean>(false);

const isNew = computed(() => {
  const targetTime = (lastImportState.value?.importedAt ?? Date.now()) - newBookmarkTime;
  return props.bookmark.importedAt && props.bookmark.importedAt?.getTime() > targetTime;
});
const actions = computed<Partial<Record<BookmarkAction, boolean>>>(() => {
  const result: Partial<Record<BookmarkAction, boolean>> = {};
  for (const action of Object.values(BookmarkAction)) {
    result[action] = props.enabledActions?.includes(action);
  }
  return result;
});

function runHighlightAnimationWhenVisible(): void {
  const element = elementRef.value;
  if (!element) {
    highlightItem.value = false;
    return;
  }

  const intersectionObserver = new IntersectionObserver(onIntersection, { threshold: 0.5 });
  function onIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        highlightItem.value = true;
        intersectionObserver.disconnect();
      }
    });
  }
  intersectionObserver.observe(element);
}
</script>

<style lang="scss" scoped>
@forward './BookmarkItem';
</style>
