<template>
  <div class="bookmark-share-dialog">
    <NForm
      v-if="!shareLink"
      class="bookmark-share-form"
      labelPlacement="left"
      requireMarkPlacement="right-hanging"
      labelWidth="auto"
      :disabled="loading"
      :showFeedback="false"
    >
      <NFormItem :label="t('common.title')" path="title">
        <NInput v-model:value="formValue.title" :placeholder="'(' + t('common.optional') + ')'" />
      </NFormItem>
      <NFormItem :label="t('common.description')" path="description">
        <NInput v-model:value="formValue.description" type="textarea" :placeholder="'(' + t('common.optional') + ')'" />
      </NFormItem>
      <NFormItem :label="t('common.books')">
        <div class="bookmark-share-book-grid">
          <template v-for="book of books" :key="book.id">
            <BookCoverIconView :src="book.coverImageUrl" :title="book.info.title" />
            <span class="bookmark-share-book-title">{{ book.info.title }}</span>
          </template>
        </div>
      </NFormItem>
    </NForm>

    <div v-if="shareLink" class="bookmark-share-result">
      <div class="bookmark-share-result-grid">
        <div v-if="formValue.title" class="bookmark-share-result-row">
          <p class="bookmark-share-result-row-label">
            <i18n-t keypath="common.title" />
          </p>
          <span>{{ formValue.title }}</span>
        </div>
        <div v-if="formValue.description" class="bookmark-share-result-row">
          <p class="bookmark-share-result-row-label">
            <i18n-t keypath="common.description" />
          </p>
          <span>{{ formValue.description }}</span>
        </div>

        <div class="bookmark-share-result-row">
          <p class="bookmark-share-result-row-label">
            <i18n-t keypath="common.books" />
          </p>
          <div class="bookmark-share-book-grid">
            <template v-for="book of books" :key="book.id">
              <BookCoverIconView :src="book.coverImageUrl" :title="book.info.title" />
              <span class="bookmark-share-book-title">{{ book.info.title }}</span>
            </template>
          </div>
        </div>

        <div class="bookmark-share-result-row">
          <p class="bookmark-share-result-row-label">
            <i18n-t keypath="common.link" />
          </p>
          <div class="bookmark-share-result-url">
            <a class="bookmark-share-link" target="_blank" :href="shareLink">{{ shareLink }}</a>
            <CopyButton type="primary" :content="shareLink" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!shareLink" class="bookmark-share-dialog-actions">
      <NButton size="small" @click="emit('closeClick')">
        <i18n-t keypath="common.close" />
      </NButton>
      <NButton size="small" type="primary" :loading="loading" @click="createShareLink">
        <i18n-t keypath="common.create" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useBrowserLocation } from '@vueuse/core';
import { NForm, NFormItem, NInput, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import BookCoverIconView from '@/component/BookCoverIconView/BookCoverIconView.vue';
import CopyButton from '@/component/CopyButton/CopyButton.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookmarkShare } from '@/dto/bookmark-share';
import { KoboBook } from '@/dto/kobo-book';
import { removeUnnecessaryPropsFromBookForShare } from '@/services/bookmark-share/bookmark-share.service';
import {
  saveJsonToDropbox,
  createDropboxShareLink,
  calcShareIdOfDropboxLink,
} from '@/services/dropbox/dropbox.service';
import { formatDateToShortTimeString } from '@/util/time-utils';

const props = defineProps<{ books: KoboBook[] }>();
const emit = defineEmits<{ (e: 'closeClick'): void; (e: 'completed'): void }>();

const { t } = useI18n<[I18NMessageSchema]>();

const location = useBrowserLocation();

const formValue = ref<{ title?: string; description?: string }>({});
const loading = ref<boolean>(false);
const shareLink = ref<string>();

async function createShareLink(): Promise<void> {
  loading.value = true;
  const bookmarkShare = createBookmarkShare();
  const fileName = `bookmark-share-${formatDateToShortTimeString(bookmarkShare.createdAt)}.json`;
  shareLink.value = await uploadAndCreateShareLink(bookmarkShare, fileName);
  loading.value = false;
  emit('completed');
}

async function uploadAndCreateShareLink(bookmarkShare: BookmarkShare, fileName: string): Promise<string> {
  const dropboxFileMeta = await saveJsonToDropbox(fileName, bookmarkShare);
  const dropboxLink = await createDropboxShareLink(`/${dropboxFileMeta.name}`);
  const shareId = calcShareIdOfDropboxLink(dropboxLink);
  return `${location.value.origin}/share/${shareId}`;
}

function createBookmarkShare(): BookmarkShare {
  const now = new Date();
  return {
    title: formValue.value.title?.trim(),
    description: formValue.value.description?.trim(),
    books: props.books.map(removeUnnecessaryPropsFromBookForShare),
    createdAt: now,
  };
}
</script>

<style lang="scss" scoped>
@forward './BookmarkShareDialog';
</style>
