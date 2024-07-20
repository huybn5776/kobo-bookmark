<template>
  <div
    class="chevron-arrow-container"
    :class="{ 'chevron-arrow-container-disabled': disabled }"
    @click="toggleDirection"
  >
    <i class="chevron-arrow" :class="direction"></i>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';

const props = defineProps({
  direction: {
    type: String as PropType<'up' | 'down'>,
    default: () => 'down',
  },
  disabled: { type: Boolean },
});
const emit = defineEmits<{ (direction: 'update:direction', value: 'up' | 'down'): void }>();

const direction = ref(props.direction);

watch(
  () => props.direction,
  () => (direction.value = props.direction),
);

function toggleDirection(event: MouseEvent): void {
  direction.value = direction.value === 'up' ? 'down' : 'up';
  emit('update:direction', direction.value);
  event.stopPropagation();
}
</script>

<style lang="scss" scoped>
@import './ChevronArrow';
</style>
