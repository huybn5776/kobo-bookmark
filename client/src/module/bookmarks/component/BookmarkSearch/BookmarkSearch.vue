<template>
  <div ref="elementRef" class="bookmark-search">
    <NSelect
      ref="selectRef"
      filterable
      multiple
      :clearFilterAfterSelect="false"
      :placeholder="t('common.search')"
      :options="options"
      :value="selectedValue"
      @update:value="onSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, Ref } from 'vue';

import { NSelect } from 'naive-ui';
import type { SelectGroupOption } from 'naive-ui/es/select/src/interface';
import { SelectBaseOption } from 'naive-ui/es/select/src/interface';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';

const props = defineProps<{ books: KoboBook[] }>();
const emits = defineEmits<{
  (e: 'cancel'): void;
  (e: 'selected', book: KoboBook, bookmark: KoboBookmark): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();
const selectedValue = ref<string[]>([]);
const elementRef = ref<HTMLElement>();
const selectRef = ref<InstanceType<typeof NSelect>>();
const options: Ref<SelectGroupOption[]> = computed(() => {
  return props.books.map((book) => {
    return {
      type: 'group',
      label: book.info.title,
      key: book.id,
      children: book.bookmarks.map((bookmark) => {
        const option: SelectBaseOption = {
          value: bookmark.id,
          label: bookmark.text,
          book,
          bookmark,
        };
        return option;
      }),
    };
  });
});

onMounted(() => {
  selectRef.value?.focusInput();
});

function onSelect(_: string, selectedOptions: (SelectBaseOption & { book: KoboBook; bookmark: KoboBookmark })[]): void {
  const option = selectedOptions[0];
  emits('selected', option.book, option.bookmark);
}
</script>

<style lang="scss" scoped>
@import './BookmarkSearch';
</style>
