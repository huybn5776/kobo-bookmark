<template>
  <div ref="elementRef" class="tags-dropdown">
    <input
      ref="tagInput"
      v-model="tagInputValue"
      class="tag-input"
      type="text"
      aria-label="tag"
      @keydown="onTagInputKeyDown"
    />
    <NVirtualList
      v-if="dropdownTags.length"
      ref="virtualListRef"
      :itemSize="36"
      :items="dropdownTags"
      keyField="key"
      class="tags-dropdown-container"
    >
      <!--suppress VueUnrecognizedSlot -->
      <template #default="{ item: tag }">
        <button
          class="tag-dropdown-item"
          :class="{
            'tag-dropdown-item-pending': tag.key === pendingTag?.key,
            'tag-dropdown-item-disabled': tag.disabled,
          }"
          @click="selectTag(tag)"
          @mouseover="onTagHover(tag)"
          @focusin="onTagHover(tag)"
        >
          <TagBarItem class="tags-dropdown-tag" :label="tag.label" @removeClick="emit('removeTag', tag.key)" />
        </button>
      </template>
    </NVirtualList>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, ComponentInstance, onMounted, watch } from 'vue';

import { onClickOutside } from '@vueuse/core';
import { NVirtualList } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import TagBarItem from '@/module/bookmarks/component/TagBarItem/TagBarItem.vue';
import { scrollToElementIfNotInView } from '@/util/dom-utils';

const { t } = useI18n<[I18NMessageSchema]>();

const props = defineProps<{ currentTagTitles: string[]; allTags: { title: string; count: number }[] }>();
const emit = defineEmits<{
  (e: 'addTag', value: string): void;
  (e: 'removeTag', value: string): void;
  (e: 'clickOutside'): void;
}>();

type TagDropdownItem = { key: string; label: string; disabled?: boolean };

const elementRef = ref<HTMLElement>();
const tagInput = ref<HTMLInputElement>();
const virtualListRef = ref<ComponentInstance<typeof NVirtualList>>();
const tagInputValue = ref('');
const pendingTag = ref<TagDropdownItem>();

const dropdownTags = computed<TagDropdownItem[]>(() => {
  const notSelectedTags = (
    props.currentTagTitles.length
      ? props.allTags.filter((tag) => !props.currentTagTitles.includes(tag.title))
      : props.allTags
  ).map((tag) => ({ key: tag.title, label: `${tag.title}${tag.count ? ` (${tag.count})` : ''}`, count: tag.count }));
  if (!tagInputValue.value) {
    return notSelectedTags;
  }
  const lowerCaseSearch = tagInputValue.value.toLowerCase();
  const filteredTags = notSelectedTags.filter((tag) => tag.key.toLowerCase().includes(lowerCaseSearch));
  let newTag: TagDropdownItem;
  if (filteredTags.some((tag) => tag.key.toLowerCase() === lowerCaseSearch)) {
    return filteredTags;
  }
  if (props.currentTagTitles.some((title) => title.toLowerCase() === lowerCaseSearch)) {
    newTag = {
      key: tagInputValue.value,
      label: `${tagInputValue.value} (${t('common.exists')})`,
      disabled: true,
    };
  } else {
    newTag = { key: tagInputValue.value, label: t('page.bookmarks.create_tag', [tagInputValue.value]) };
  }
  return [...filteredTags, newTag];
});

onMounted(() => {
  const listElement = virtualListRef.value?.$el as HTMLElement;
  if (listElement) {
    scrollToElementIfNotInView(listElement, { block: 'end' });
  }
  tagInput.value?.focus();
});

watch(
  () => dropdownTags.value,
  () => ([pendingTag.value] = dropdownTags.value),
  { immediate: true },
);

onClickOutside(elementRef, (event) => {
  event.stopPropagation();
  emit('clickOutside');
});

function onTagHover(tag: TagDropdownItem): void {
  if (!tag.disabled) {
    pendingTag.value = tag;
  }
}

function onTagInputKeyDown(event: KeyboardEvent): void {
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.code === 'ArrowDown') {
    movePendingTag(1);
    event.preventDefault();
  } else if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.code === 'ArrowUp') {
    movePendingTag(-1);
    event.preventDefault();
  } else if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.key === 'Enter') {
    selectTag(pendingTag.value);
  }
}

function movePendingTag(offset: number): void {
  const currentPendingTagKey = pendingTag.value?.key;
  if (!currentPendingTagKey) {
    [pendingTag.value] = dropdownTags.value;
    return;
  }
  let newIndex = dropdownTags.value.findIndex((tag) => tag.key === currentPendingTagKey);
  do {
    newIndex += offset;
  } while (dropdownTags.value[newIndex]?.disabled);
  pendingTag.value = dropdownTags.value[newIndex] || pendingTag.value;
  scrollToTag(pendingTag.value.key);
}

function selectTag(tag: TagDropdownItem | undefined): void {
  if (tag && !tag.disabled) {
    emit('addTag', tag.key);
  }
}

function scrollToTag(key: string | undefined): void {
  if (key) {
    virtualListRef.value?.scrollTo({ key });
  }
}
</script>

<style lang="scss" scoped>
@forward './TagsDropdown';
</style>
