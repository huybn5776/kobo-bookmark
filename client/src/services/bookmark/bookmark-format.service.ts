import { KoboBookmarkChapter } from '@/dto/kobo-book';

export function chapterTitleToText(chapter: KoboBookmarkChapter): string {
  return chapter.parentChapters.map((c) => `${c.title} > `) + chapter.titles.join(' - ');
}
