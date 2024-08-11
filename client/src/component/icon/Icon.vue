<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <svg>
    <use :href="'/icons/icon.svg#' + name" />
  </svg>
</template>

<script lang="ts" setup>
import { IconName } from '@/component/icon';

defineProps<{ name?: IconName }>();
</script>
