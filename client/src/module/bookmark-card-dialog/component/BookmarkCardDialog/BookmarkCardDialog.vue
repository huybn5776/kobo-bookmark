<template>
  <div class="bookmark-card-dialog">
    <div class="bookmark-card-dialog-content">
      <div class="bookmark-card-setting">
        <div class="bookmark-card-setting-item">
          <p class="bookmark-card-setting-label">
            <i18n-t keypath="page.bookmarks.theme" />
          </p>
          <div class="bookmark-card-theme">
            <NButton
                v-for="theme of cardThemes"
                :key="theme.bg + theme.fg"
                class="bookmark-card-theme-button"
                circle
                :style="{ backgroundColor: theme.bg, color: theme.fg }"
                @click="applyTheme(theme)"
            >
              <FormatTextVariantIcon class="icon-24" />
            </NButton>
          </div>
        </div>

        <div class="bookmark-card-setting-item">
          <p class="bookmark-card-setting-label">
            <i18n-t keypath="page.bookmarks.font_size" />
          </p>
          <div class="bookmark-card-font-size">
            <NButton circle :disabled="fontSize <= minFontSize" @click="adjustFontSize(-1)">
              <FormatFontSizeDecreaseIcon class="icon-20" />
            </NButton>
            <NButton circle :disabled="fontSize >= maxFontSize" @click="adjustFontSize(1)">
              <FormatFontSizeIncreaseIcon class="icon-20" />
            </NButton>
            <NButton circle @click="autoFontSize()">
              <ArrowExpandVerticalIcon class="icon-20" />
            </NButton>
          </div>
        </div>
      </div>

      <div ref="cardPreviewRef" class="bookmark-card-preview" :style="{ color: cardFontColor }">
        <img class="bookmark-card-background-image" :src="book.coverImageUrl" :alt="book.info.title" />
        <i class="bookmark-card-background-cover" :style="{ backgroundColor: cardBackgroundColor }" />
        <i class="bookmark-card-background-gradient" />
        <FormatQuoteOpenIcon class="bookmark-card-quote bookmark-card-quote-open" />
        <FormatQuoteCloseIcon class="bookmark-card-quote bookmark-card-quote-close" />
        <div class="bookmark-card-bookmark-content">
          <span
              ref="cardTextRef"
              contenteditable
              class="bookmark-card-bookmark-text"
              :style="{ fontSize: `${fontSize}px` }"
              @input="onBookmarkTextChange"
          >
            {{ bookmarkText }}
          </span>
          <span contenteditable class="bookmark-card-book-name" @input="onBookTitleChange">{{ bookTitle }}</span>
        </div>
      </div>
    </div>

    <div class="bookmark-card-dialog-actions">
      <NButton size="small" @click="emits('closeClick')">
        <i18n-t keypath="common.close" />
      </NButton>
      <NButton size="small" type="primary" @click="downloadBookmarkImage">
        <i18n-t keypath="page.bookmarks.download_image" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { toJpeg } from 'html-to-image';
import { NButton } from 'naive-ui';

import {
  FormatTextVariantIcon,
  FormatFontSizeDecreaseIcon,
  FormatFontSizeIncreaseIcon,
  ArrowExpandVerticalIcon,
  FormatQuoteOpenIcon,
  FormatQuoteCloseIcon,
} from '@/component/icon';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { downloadFile } from '@/util/file-utils';

const props = defineProps<{ book: KoboBook; bookmark: KoboBookmark }>();
const emits = defineEmits<{ (e: 'closeClick'): void }>();

const cardThemes: { bg: string; fg: string }[] = [
  { bg: '#ffffff', fg: '#2d2d2d' },
  { bg: '#333333', fg: '#ffffff' },
  { bg: '#e83828', fg: '#ffffff' },
  { bg: '#e61673', fg: '#ffffff' },
  { bg: '#ff9676', fg: '#3e4959' },
  { bg: '#e56db1', fg: '#000000' },
  { bg: '#be84a3', fg: '#000000' },
  { bg: '#ffc845', fg: '#000000' },
  { bg: '#dae000', fg: '#ffffff' },
  { bg: '#aa9187', fg: '#efefef' },
  { bg: '#94a596', fg: '#000000' },
  { bg: '#003b49', fg: '#ffc845' },
  { bg: '#003b49', fg: '#d0d3d4' },
  { bg: '#1b365d', fg: '#d0d3d4' },
  { bg: '#f7f3e7', fg: '#514a46' },
  { bg: '#00bfb2', fg: '#000000' },
  { bg: '#d6d2c4', fg: '#000000' },
  { bg: '#41b6e6', fg: '#000000' },
  { bg: '#7da1c4', fg: '#000000' },
];
const minFontSize = 10;
const maxFontSize = 36;
const maxFileNameLength = 50;

const cardPreviewRef = ref<HTMLElement>();
const cardTextRef = ref<HTMLElement>();
const cardBackgroundColor = ref(cardThemes[0].bg);
const cardFontColor = ref(cardThemes[0].fg);
const fontSize = ref(36);

const bookmarkText = ref(props.bookmark.text);
const bookTitle = ref(props.book.info.title);

onMounted(() => autoFontSize());

function onBookmarkTextChange(event: Event): void {
  bookmarkText.value = (event.target as HTMLElement).innerText;
}

function onBookTitleChange(event: Event): void {
  bookTitle.value = (event.target as HTMLElement).innerText;
}

function autoFontSize(): void {
  const [cardElement, cardTextElement] = [cardPreviewRef.value, cardTextRef.value];
  if (!cardElement || !cardTextElement) {
    return;
  }
  let currentFontSize = maxFontSize;

  const textElementClone = cardTextElement.cloneNode(true) as HTMLElement;
  cardTextElement.parentElement?.appendChild(textElementClone);
  textElementClone.style.visibility = 'hidden';
  textElementClone.style.height = 'auto';

  const maximumHeight = cardTextElement.offsetHeight;
  const comfortableHeight = maximumHeight * 0.7;
  const targetHeight = textElementClone.scrollHeight > comfortableHeight ? comfortableHeight : maximumHeight;

  while (currentFontSize > minFontSize) {
    textElementClone.style.fontSize = `${currentFontSize}px`;
    textElementClone.getBoundingClientRect();
    if (textElementClone.scrollHeight <= targetHeight) {
      break;
    }
    currentFontSize -= 1;
  }

  cardTextElement.parentElement?.removeChild(textElementClone);
  fontSize.value = currentFontSize;
}

function applyTheme(theme: { bg: string; fg: string }): void {
  cardBackgroundColor.value = theme.bg;
  cardFontColor.value = theme.fg;
}

function adjustFontSize(offset: number): void {
  fontSize.value = Math.max(minFontSize, Math.min(maxFontSize, fontSize.value + offset));
}

async function downloadBookmarkImage(): Promise<void> {
  const cardElement = cardPreviewRef.value;
  if (!cardElement) {
    return;
  }
  const dataUrl = await toJpeg(cardElement);
  const fileName = bookmarkText.value.slice(0, maxFileNameLength);
  downloadFile(dataUrl, `${fileName}.jpg`);
}
</script>

<style lang="scss" scoped>
@import './BookmarkCardDialog';
</style>