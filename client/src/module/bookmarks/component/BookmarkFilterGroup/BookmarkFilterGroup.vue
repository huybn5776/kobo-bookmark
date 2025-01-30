<template>
  <div class="bookmark-filter-group">
    <button
      class="bookmark-filter-group-header"
      :class="{ 'bookmark-filter-group-header-active': hasSelectedValue }"
      @click="emit('update:expanded', !expanded)"
    >
      <span><i18n-t :keypath="titleKey" /></span>
      <IconButton v-if="hasSelectedValue" i18nKey="common.remove" @click="onRemoveButtonClick">
        <Icon name="close-circle" class="icon-20" />
      </IconButton>
      <ChevronArrow
        :direction="expanded ? 'up' : 'down'"
        @update:direction="emit('update:expanded', $event === 'up')"
      />
    </button>
    <template v-if="expanded">
      <NInput
        v-if="searchable"
        v-model:value="searchText"
        class="bookmark-filter-search-input"
        clearable
        :placeholder="t('common.search')"
        @keydown="onInputKeyDown"
      />
      <div class="bookmark-filter-group-items-container">
        <template v-for="(item, index) in visibleItems" :key="item[keyField]">
          <button
            class="bookmark-filter-group-item"
            :class="{ 'bookmark-filter-group-item-selected': selectedIndexes[index] }"
            @click="toggleSelectedItem(item)"
          >
            <slot :item="item as T" :index="index" />
            <Icon v-if="selectedIndexes[index]" name="check" class="bookmark-filter-checked-icon" />
          </button>
        </template>
        <div v-if="!visibleItems.length" class="bookmark-filter-group-empty-item">
          (<i18n-t :keypath="emptyMessageKey || 'common.empty'" />)
        </div>
      </div>
    </template>
  </div>
</template>

<script
  lang="ts"
  setup
  generic="T extends object, K extends keyof T, SK extends keyof T, KT = T[K], IT extends KT[] | KT = KT[]"
>
import { computed, Ref, ref } from 'vue';

import { NInput } from 'naive-ui';
import { remove } from 'ramda';
import { useI18n } from 'vue-i18n';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { I18NMessageSchema } from '@/config/i18n-config';

const props = defineProps<{
  titleKey: string;
  expanded: boolean;
  items: T[];
  keyField: K;
  searchField?: SK;
  single?: boolean;
  searchable?: boolean;
  emptyMessageKey?: string;
}>();
const emit = defineEmits<{ (e: 'update:expanded', value: boolean): void; (e: 'escape'): void }>();
const valueModel = defineModel<IT>('value');

const { t } = useI18n<[I18NMessageSchema]>();

const searchText = ref<string>('');

const visibleItems = computed<T[]>(() => {
  const { searchable, searchField, items } = props;
  if (!searchable || !searchField || !searchText.value) {
    return items;
  }
  const search = searchText.value.toLowerCase();
  return props.items.filter((item) => `${item[searchField]}`.toLowerCase().includes(search));
});
const selectedIndexes = computed(() => {
  if (!valueModel.value) {
    return [];
  }
  const map: Record<number, boolean> = {};
  const items = Array.isArray(valueModel.value) ? valueModel.value : [valueModel.value];
  items.forEach((key) => {
    const index = visibleItems.value.findIndex((item) => item[props.keyField] === key);
    map[index] = true;
  });
  return map;
});
const hasSelectedValue = computed(() => !!Object.values(selectedIndexes.value).length);

function onRemoveButtonClick(event: MouseEvent): void {
  event.stopPropagation();
  valueModel.value = undefined;
}

function onInputKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    if (visibleItems.value[0]) {
      toggleSelectedItem(visibleItems.value[0]);
    }
  } else if (event.key === 'Escape') {
    if (searchText.value) {
      searchText.value = '';
    } else if (valueModel.value) {
      valueModel.value = undefined;
    } else {
      emit('escape');
    }
  }
}

function toggleSelectedItem(item: T): void {
  const key = item[props.keyField] as KT;
  if (props.single) {
    toggleItemSingle(key);
  } else {
    toggleItemMulti(key);
  }
}

function toggleItemSingle(key: KT): void {
  const valueRef = valueModel as Ref<KT | undefined>;
  if (valueRef.value === key) {
    valueRef.value = undefined;
  } else {
    valueRef.value = key;
  }
}

function toggleItemMulti(key: KT): void {
  const valueRef = valueModel as Ref<KT[]>;
  const index = (valueRef.value || []).findIndex((selectedKey) => selectedKey === key);
  if (index === -1) {
    valueRef.value = [...(valueRef.value || []), key];
  } else {
    valueRef.value = remove(index, 1, valueRef.value);
  }
}
</script>

<style lang="scss" scoped>
@import './BookmarkFilterGroup';
</style>
