import { groupBy, prop, indexBy, maxBy } from 'ramda';

import { KoboBook, KoboBookmark, KoboBookChapter, KoboBookmarkChapter, KoboBookInfo } from '@/dto/kobo-book';
import { BookmarkEntity, ChapterEntity } from '@/entity';
import { BookInfoEntity } from '@/entity/book-info-entity';
import { HighlightColor } from '@/enum/highlight-color';
import { openDb, getBookmarks, getBookChapters, getBooksInfo } from '@/repository/book.repository';

export async function getBooksFromSqliteFile(file: Blob, bookIds?: string[]): Promise<KoboBook[]> {
  const buffer = await file.arrayBuffer();
  const db = await openDb(new Uint8Array(buffer));
  const allBookmarks = getBookmarks(db, bookIds).filter((bookmark) => !bookmark.hidden);
  const bookIdsToQuery = Array.from(new Set(allBookmarks.map((bookmark) => bookmark.volumeId)));
  const allChapters = getBookChapters(db, bookIdsToQuery);
  const allBooksInfo = getBooksInfo(db, bookIdsToQuery);

  const booksMap = indexBy(prop('id'), allBooksInfo);
  const bookChapters = groupBy(prop('bookId'), allChapters);
  const bookmarkByBooks = groupBy(prop('volumeId'), allBookmarks) as Record<string, BookmarkEntity[]>;

  return Object.entries(bookmarkByBooks).map(([volumeId, bookmarks]) => {
    const bookInfo = booksMap[volumeId];
    const chapterEntities = bookChapters[volumeId] ?? [];
    const chapters = chapterEntityToKoboChapters(chapterEntities);
    const koboBookmarks = bookmarkEntityToKoboBookmark(bookmarks, chapterEntities, chapters);
    const koboBook: KoboBook = {
      id: volumeId,
      info: bookInfoEntityToKoboBookInfo(bookInfo, chapterEntities),
      chapters,
      bookmarks: koboBookmarks,
      version: 1,
      isArchived: 0,
    };
    koboBook.info.lastBookmarkAt = koboBookmarks.reduce(maxBy((bookmark) => bookmark.createdAt)).createdAt;
    return koboBook;
  });
}

function bookmarkEntityToKoboBookmark(
  bookmarks: BookmarkEntity[],
  chapterEntities: ChapterEntity[],
  chapters: KoboBookChapter[],
): KoboBookmark[] {
  const chapterIndexMap = getChapterIndexMap(chapters);
  const chapterParentsMap = getChaptersParentIndexesMap(chapters);

  return bookmarks.map((bookmark) => {
    const relatedChapterEntities = findBookmarkChapters(bookmark, chapterEntities);
    let relatedChapters = relatedChapterEntities.map((chapter) => chapterIndexMap[chapter.index]);
    relatedChapters = combineRelatedChaptersToParent(chapterParentsMap, relatedChapters);
    const koboBookChapter = buildBookmarkChapter(chapterParentsMap, relatedChapters);
    const koboBook: KoboBookmark = {
      id: bookmark.id,
      text: prettifyBookmarkText(bookmark),
      annotation: bookmark.annotation,
      chapter: koboBookChapter,
      chapterProgress: bookmark.chapterProgress,
      startContainerPath: bookmark.startContainerPath,
      endContainerPath: bookmark.endContainerPath,
      color: bookmarkColorEntityValueToHighlightColor(bookmark.color),
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
    };
    return koboBook;
  });
}

function findBookmarkChapters(bookmark: BookmarkEntity, chapterEntities: ChapterEntity[]): ChapterEntity[] {
  let relatedChapters: ChapterEntity[] = chapterEntities.filter(
    (chapter) => chapter.chapterIdBookmarked === bookmark.contentId,
  );
  if (!relatedChapters.length) {
    relatedChapters = chapterEntities.filter((chapter) => {
      const contentId = chapter.contentId.replace(/-\d{0,3}$/g, '');
      return contentId === bookmark.contentId;
    });
  }
  return relatedChapters;
}

function combineRelatedChaptersToParent(
  chapterParentsMap: Record<number, KoboBookChapter[]>,
  relatedChapters: KoboBookChapter[],
): KoboBookChapter[] {
  if (relatedChapters.length <= 1) {
    return relatedChapters;
  }
  const parentChapters = chapterParentsMap[relatedChapters[0].index];
  if (!parentChapters?.length) {
    return [relatedChapters[0]];
  }
  const parentChapterKey = parentChapters.map(prop('index')).join();
  for (let i = 1; i < relatedChapters.length; i += 1) {
    const currentParentChapters = chapterParentsMap[relatedChapters[i].index];
    if (!currentParentChapters?.length) {
      return relatedChapters;
    }
    const currentParentChaptersKey = currentParentChapters.map(prop('index')).join();
    if (currentParentChaptersKey !== parentChapterKey) {
      return relatedChapters;
    }
  }
  return parentChapters;
}

export function buildBookmarkChapter(
  chapterParentsMap: Record<number, KoboBookChapter[]>,
  relatedChapters: KoboBookChapter[],
): KoboBookmarkChapter {
  if (!relatedChapters.length) {
    return { relatedChapterIndexes: [] };
  }
  const parentChapters = chapterParentsMap[relatedChapters[0].index];
  const bookmarkChapter: KoboBookmarkChapter = {
    relatedChapterIndexes: relatedChapters.map((chapter) => chapter.index),
  };
  if (parentChapters?.length) {
    bookmarkChapter.parentChapterIndexes = parentChapters.map(prop('index'));
  }
  return bookmarkChapter;
}

function prettifyBookmarkText(bookmark: BookmarkEntity): string {
  return bookmark.text
    .trim()
    .replaceAll(/\t+\n/g, '')
    .replaceAll(/\n+/g, '\n')
    .replaceAll(/\n\s+/g, '\n')
    .replaceAll(/\n\u3000+/g, '\n')
    .replace(/\n$/g, '')
    .replaceAll(/(^\t+|(?<=\n)\t+)/g, '\t');
}

function chapterEntityToKoboChapters(chapters: ChapterEntity[]): KoboBookChapter[] {
  const currentParentChapters: KoboBookChapter[] = [];
  const topLevelChapters: KoboBookChapter[] = [];

  for (const chapterEntity of chapters) {
    const chapter: KoboBookChapter = { title: chapterEntity.title, index: chapterEntity.index };
    const { depth } = chapterEntity;
    if (depth === 1) {
      topLevelChapters.push(chapter);
    } else if (depth > 1) {
      const parentChapter = currentParentChapters[depth - 2];
      parentChapter.children = parentChapter.children ? [...parentChapter.children, chapter] : [chapter];
    }
    currentParentChapters.length = depth;
    currentParentChapters[depth - 1] = chapter;
  }

  return topLevelChapters;
}

function bookmarkColorEntityValueToHighlightColor(value: number | undefined): HighlightColor | undefined {
  switch (value) {
    case 1:
      return HighlightColor.Red;
    case 2:
      return HighlightColor.Blue;
    case 3:
      return HighlightColor.Green;
    default:
      return undefined;
  }
}

function bookInfoEntityToKoboBookInfo(
  book: BookInfoEntity | undefined,
  chapters: ChapterEntity[] | undefined,
): KoboBookInfo {
  return {
    title: book?.title || chapters?.[0]?.bookTitle,
    subtitle: book?.subtitle,
    author: book?.author,
    description: book?.description,
    publisher: book?.publisher,
    publicationDate: toPublicationDateIfValid(book?.createdAt),
    series: book?.series,
    isbn: book?.isbn,
    timeSpentReading: book?.timeSpentReading,
    imageId: book?.imageId,
    isSideLoaded: book ? book.id.startsWith('file') : true,
    fileSize: book?.fileSize,
    lastReadAt: book?.lastReadAt,
    createdAt: book?.createdAt,
  };
}

function toPublicationDateIfValid(createdAt: Date | undefined): Date | undefined {
  return createdAt && !createdAt.getMinutes() && !createdAt.getSeconds() ? createdAt : undefined;
}

export function getChapterIndexMap(chapters: KoboBookChapter[]): Record<number, KoboBookChapter> {
  const flattenedChapters = chapters.flatMap(flattenChapter);
  return indexBy(prop('index'), flattenedChapters);
}

function flattenChapter(chapter: KoboBookChapter): KoboBookChapter[] {
  return [chapter, ...(chapter.children?.flatMap(flattenChapter) ?? [])];
}

export function getChaptersParentIndexesMap(
  chapters: KoboBookChapter[],
  parentChapters: KoboBookChapter[] = [],
): Record<number, KoboBookChapter[]> {
  const result: Record<number, KoboBookChapter[]> = {};
  for (const chapter of chapters) {
    if (!chapter.children?.length) {
      continue;
    }
    const currentParentChapter = [...parentChapters, chapter];
    for (const childrenChapter of chapter.children) {
      result[childrenChapter.index] = currentParentChapter;
      const nestedResult = getChaptersParentIndexesMap([childrenChapter], currentParentChapter);
      Object.assign(result, nestedResult);
    }
  }
  return result;
}
