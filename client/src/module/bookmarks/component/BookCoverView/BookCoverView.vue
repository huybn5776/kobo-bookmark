<template>
  <div class="book-cover-view">
    <NImage v-if="book.coverImageUrl" class="book-cover-image" :src="book.coverImageUrl" :alt="book.info.title" />
    <div v-if="!book.coverImageUrl" class="fallback-book-cover">
      <span class="fallback-image-cover-text">
        {{ book.info.title }}
      </span>
    </div>

    <div class="book-cover-view-toolbar">
      <IconButton
        class="book-cover-toolbar-button book-cover-star-button"
        :class="{ 'book-cover-star-button-started': book.tags?.star }"
        :i18nKey="book.tags?.star ? 'page.bookmarks.remove_star_mark' : 'page.bookmarks.add_star_mark'"
        keepPopoverWhenClick
        @click="emit('starClick')"
      >
        <Icon v-if="book.tags?.star" name="star" class="icon-24" />
        <Icon v-if="!book.tags?.star" name="star-outline" class="icon-24" />
      </IconButton>
      <IconButton
        class="book-cover-toolbar-button book-cover-edit-button"
        i18nKey="common.change_image"
        @click="showChangeCoverImageDialog"
      >
        <Icon name="image-edit" class="book-cover-edit-icon" />
      </IconButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as E from 'fp-ts/Either';
import { NImage, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { useInputDialog } from '@/composition/use-input-dialog';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import { processImageUrl } from '@/services/bookmark/book-cover.service';

const props = defineProps<{ book: KoboBook }>();
const emit = defineEmits<{ (e: 'starClick'): void; (e: 'coverImageUpdated', value: string): void }>();

const { t } = useI18n<[I18NMessageSchema]>();

const message = useMessage();
const inputDialog = useInputDialog();

function showChangeCoverImageDialog(): void {
  inputDialog.open({
    showIcon: false,
    title: t('page.bookmarks.change_cover_image'),
    placeholder: t('common.image_url'),
    value: props.book.coverImageUrl || '',
    inputType: 'textarea',
    minRows: 3,
    inputProps: { type: 'url' },
    beforeClose: onNewCoverImageEntered,
  });
}

async function onNewCoverImageEntered(newCoverImageUrl: string): Promise<boolean> {
  const url = newCoverImageUrl.trim();
  if (url === props.book.coverImageUrl) {
    return true;
  }
  const result = await processImageUrl(url);
  if (E.isLeft(result)) {
    inputDialog.setErrorMessage(t(result.left));
    return false;
  }
  emit('coverImageUpdated', result.right);
  message.success(t('page.bookmarks.cover_image_updated'));
  return true;
}
</script>

<style lang="scss" scoped>
@forward './BookCoverView';
</style>
