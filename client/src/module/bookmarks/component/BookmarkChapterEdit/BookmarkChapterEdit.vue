<template>
  <p class="bookmark-chapter-edit">
    <NTreeSelect
      ref="bookmarkListRef"
      :options="options"
      :value="chapterIndex"
      :defaultExpandedKeys="defaultExpandedKeys"
      :renderTag="renderTag"
      @update:value="updateChapter"
      @updateShow="onShow"
    />
  </p>
</template>

<script lang="ts" setup>
import { computed, h, type VNodeChild, ref } from 'vue';

import { NTreeSelect, NTree } from 'naive-ui';
import type { TreeSelectOption } from 'naive-ui/es/tree-select/src/interface';

import { KoboBookmarkChapter, KoboBookChapter } from '@/dto/kobo-book';
import BookmarkChapterViewContent from '@/module/bookmarks/component/BookmarkChapterViewContent/BookmarkChapterViewContent.vue';
import { buildBookmarkChapter, getChaptersParentIndexesMap } from '@/services/bookmark/kobo-bookmark.service';

const props = defineProps<{ allChapters: KoboBookChapter[]; chapterIndexMap: Record<number, KoboBookChapter> }>();

const chapterModel = defineModel<KoboBookmarkChapter>('chapter');
const bookmarkListRef = ref<InstanceType<typeof NTreeSelect>>();

const defaultExpandedKeys = chapterModel.value?.parentChapterIndexes ?? chapterModel.value?.relatedChapterIndexes;
const options = computed<TreeSelectOption[]>(() => props.allChapters.map(chapterToOption));
const chapterIndex = computed(() => chapterModel.value?.relatedChapterIndexes[0]);

const chapterParentsMap = computed(() => getChaptersParentIndexesMap(props.allChapters));

function renderTag({ option }: { option: TreeSelectOption }): VNodeChild {
  const { chapter } = option as TreeSelectOption & { chapter: KoboBookChapter };
  const bookmarkChapter = buildBookmarkChapter(chapterParentsMap.value, [chapter]);
  return h(BookmarkChapterViewContent, { chapterIndexMap: props.chapterIndexMap, chapter: bookmarkChapter });
}

function chapterToOption(chapter: KoboBookChapter): TreeSelectOption {
  return {
    key: chapter.index,
    label: chapter.title,
    children: chapter.children?.map(chapterToOption),
    chapter,
  };
}

function updateChapter(index: number): void {
  const chapter = props.chapterIndexMap[index];
  chapterModel.value = buildBookmarkChapter(chapterParentsMap.value, [chapter]);
}

function onShow(show: boolean): void {
  if (!show) {
    return;
  }
  setTimeout(focusToParentChapter);
}

function focusToParentChapter(): void {
  const treeSelectRef = bookmarkListRef.value?.treeInstRef as InstanceType<typeof NTree>;
  treeSelectRef.scrollTo({ position: 'bottom' });

  let indexToFocus = chapterIndex.value;
  if (indexToFocus === undefined) {
    return;
  }
  indexToFocus = chapterParentsMap.value[indexToFocus]?.[0].index || indexToFocus;
  treeSelectRef.scrollTo({ key: indexToFocus });
}
</script>

<style lang="scss" scoped>
@import './BookmarkChapterEdit';
</style>
