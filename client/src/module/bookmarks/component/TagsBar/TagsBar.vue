<template>
  <div class="tags-bar" :class="{ 'tab-bar-editing': editing }">
    <div class="tags-container">
      <TagBarItem
        v-for="title of currentTagTitles"
        :key="title"
        allowRemove
        :label="title"
        @removeClick="removeTag(title)"
      />
    </div>

    <TagsDropdown
      v-if="editing"
      :currentTagTitles="currentTagTitles"
      :allTags="allAvailableTags"
      @addTag="addTag"
      @removeTag="removeTag"
      @clickOutside="emits('finish')"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { KoboBookmark, KoboBookmarkTag } from '@/dto/kobo-book';
import TagBarItem from '@/module/bookmarks/component/TagBarItem/TagBarItem.vue';
import TagsDropdown from '@/module/bookmarks/component/TagsDropdown/TagsDropdown.vue';
import { provideAllBookmarkTags } from '@/symbols';
import { injectStrict } from '@/util/vue-utils';

const allAvailableTags = injectStrict(provideAllBookmarkTags);

const props = defineProps<{ bookmark: KoboBookmark; editing: boolean; readonly: boolean }>();
const emits = defineEmits<{ (e: 'tagUpdated', value: KoboBookmarkTag[]): void; (e: 'finish'): void }>();

const currentTagTitles = computed(() => props.bookmark.tags?.map((tag) => tag.title) || []);

function addTag(title: string): void {
  const updatedTags = [...(props.bookmark.tags || []), { title, createdAt: new Date() }];
  emits('tagUpdated', updatedTags);
}

function removeTag(title: string): void {
  const updatedTags = (props.bookmark.tags || []).filter((tag) => tag.title !== title);
  emits('tagUpdated', updatedTags);
}
</script>

<style lang="scss" scoped>
@import './TagsBar';
</style>
