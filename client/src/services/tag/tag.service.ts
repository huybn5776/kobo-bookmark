import { groupBy, identity, sortBy } from 'ramda';

import { KoboBook } from '@/dto/kobo-book';

export function summarizeTagsOfBooks(books: KoboBook[]): { title: string; count: number }[] {
  const allTagTitles = books
    .flatMap((book) => book.bookmarks)
    .flatMap((bookmark) => (bookmark.tags || []).map((tag) => tag.title));
  const tagTitlesGrouping = groupBy(identity, allTagTitles);
  return sortBy(([, values]) => values?.length ?? 0, Object.entries(tagTitlesGrouping))
    .toReversed()
    .map(([title, entries]) => ({ key: title, title, count: entries?.length ?? 0 }));
}
