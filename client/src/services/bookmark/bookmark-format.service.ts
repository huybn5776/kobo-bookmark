import { prop } from 'ramda';

import { KoboBookmarkChapter, KoboBookChapter } from '@/dto/kobo-book';

export function chapterTitleToText(
  chapterIndexMap: Record<number, KoboBookChapter>,
  chapter: KoboBookmarkChapter,
): string {
  const parentChapters = (chapter.parentChapterIndexes || []).map((index) => chapterIndexMap[index]);
  const relatedChapters = chapter.relatedChapterIndexes.map((index) => chapterIndexMap[index]);
  return parentChapters.map((c) => `${c.title} > `).join('') + relatedChapters.map(prop('title')).join(' - ');
}
