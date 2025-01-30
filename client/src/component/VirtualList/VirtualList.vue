<template>
  <div v-if="enabled" ref="elementRef" class="virtual-list" :style="{ height: `${itemSize * items.length}px` }">
    <div
      class="virtual-list-container"
      :style="{ height: `${itemSize * items.length}px`, transform: `translateY(${listTransformPx}px)` }"
    >
      <template v-for="(item, index) in visibleItems" :key="item[keyField]">
        <slot :item="item as T" :index="index" />
      </template>
    </div>
  </div>
  <div v-if="!enabled" ref="elementRef" class="virtual-list-disabled">
    <template v-for="(item, index) in visibleItems" :key="item[keyField]">
      <slot :item="item as T" :index="index" />
    </template>
  </div>
</template>

<script lang="ts" setup generic="T extends object, K extends keyof T">
import { computed, ref, watch } from 'vue';

import { useResizeObserver } from '@vueuse/core';

const props = defineProps<{
  itemSize: number;
  items: T[];
  keyField: K;
  scrollableElement: HTMLElement;
  focusItemKey?: T[K];
  bufferCount?: number;
  enabled?: boolean;
}>();
defineSlots<{ default(props: { item: T; index: number }): void }>();
defineExpose({ scrollTo });

const elementRef = ref<HTMLElement>();
const visibleStart = ref<number>(0);
const parentTopOffset = ref<number>(0);
const maximumHeight = ref<number>(0);
const nextScrollTopToSet = ref<number>();

useResizeObserver(props.scrollableElement, (elements) => {
  maximumHeight.value = (elements[0].target as HTMLElement).offsetHeight;
});
watch(
  () => props.scrollableElement,
  () => (maximumHeight.value = props.scrollableElement.offsetHeight),
);

const bufferCount = computed(() => props.bufferCount ?? 1);
const listTransformPx = computed(() => Math.max(0, visibleStart.value - bufferCount.value) * props.itemSize);
const visibleItemCount = computed(() => Math.ceil(maximumHeight.value / props.itemSize));
const visibleItems = computed(() => {
  const buffer = bufferCount.value as number;
  const start = Math.min(visibleStart.value, props.items.length - visibleItemCount.value + buffer);
  return props.items.slice(Math.max(0, start - buffer), start + visibleItemCount.value + buffer);
});

watch(
  () => [props.scrollableElement, elementRef.value, props.items, props.enabled],
  (newValue, oldValue, onCleanup) => {
    const { scrollableElement } = props;
    if (elementRef.value) {
      const listener = (): void => onScroll(scrollableElement);
      scrollableElement.addEventListener('scroll', listener);
      onCleanup(() => scrollableElement.removeEventListener('scroll', listener));
      parentTopOffset.value = elementRef.value.offsetTop - scrollableElement.offsetTop;
    }
    const newElementRef = newValue[1];
    const oldElementRef = oldValue[1];
    if (newElementRef !== oldElementRef && nextScrollTopToSet.value !== undefined) {
      scrollableElement.scrollTop = nextScrollTopToSet.value;
      nextScrollTopToSet.value = undefined;
    }
  },
);

watch(
  () => [props.items, props.focusItemKey],
  (newValue, oldValue) => {
    const [oldItems, oldFocusKey] = oldValue as unknown[] as [T[], K];
    const [newItems, newFocusKey] = newValue as unknown[] as [T[], K];
    scrollToLastFocusItem(oldItems, oldFocusKey, newItems, newFocusKey);
  },
);

function onScroll(scrollableElement: HTMLElement): void {
  const scrollTop = Math.max(0, scrollableElement.scrollTop - parentTopOffset.value);
  visibleStart.value = Math.floor(scrollTop / props.itemSize);
}

function scrollToLastFocusItem(oldItems: T[], oldFocusKey: K, newItems: T[], newFocusKey: K): void {
  const { scrollableElement } = props;
  const focusKey = newFocusKey || oldFocusKey;
  if (oldItems === newItems || !scrollableElement || !focusKey) {
    return;
  }
  const oldIndex = oldItems.findIndex((item) => item[props.keyField] === focusKey);
  const newIndex = newItems.findIndex((item) => item[props.keyField] === focusKey);
  if (oldIndex === -1 || newIndex === -1) {
    return;
  }
  const oldItemScrollTop = scrollableElement.scrollTop - parentTopOffset.value - oldIndex * props.itemSize;
  nextScrollTopToSet.value = oldItemScrollTop + parentTopOffset.value + newIndex * props.itemSize;
}

function scrollTo(index: number): void {
  const { scrollableElement } = props;
  scrollableElement.scrollTop = index * props.itemSize + parentTopOffset.value;
  visibleStart.value = index;
}
</script>

<style lang="scss" scoped>
@import './VirtualList';
</style>
