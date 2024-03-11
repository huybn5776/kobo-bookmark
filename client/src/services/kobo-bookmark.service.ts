import { groupBy, prop, indexBy } from 'ramda';

import { KoboBook, KoboBookmark, KoboBookChapter, KoboBookmarkChapter, KoboBookInfo } from '@/dto/kobo-book';
import { BookmarkEntity, ChapterEntity } from '@/entity';
import { BookInfoEntity } from '@/entity/book-info-entity';
import { openDb, getBookmarks, getBookChapters, getBooksInfo } from '@/repository/book.repository';

export async function getBooksFromSqliteFile(file: Blob, bookIds?: string[]): Promise<KoboBook[]> {
  const buffer = await file.arrayBuffer();
  const db = await openDb(new Uint8Array(buffer));
  const allBookmarks = getBookmarks(db, bookIds);
  const bookIdsToQuery = Array.from(new Set(allBookmarks.map((bookmark) => bookmark.volumeId)));
  const allChapters = getBookChapters(db, bookIdsToQuery);
  const allBooksInfo = getBooksInfo(db, bookIdsToQuery);

  const booksMap = indexBy(prop('id'), allBooksInfo);
  const bookChapters = groupBy(prop('bookId'), allChapters);
  const bookmarkByBooks = groupBy(prop('volumeId'), allBookmarks) as Record<string, BookmarkEntity[]>;

  return Object.entries(bookmarkByBooks).map(([volumeId, bookmarks]) => {
    const bookInfo = booksMap[volumeId];
    const chapters = bookChapters[volumeId] || [];
    const koboBookChapters = chapterEntityToKoboChapters(chapters);
    const koboBookmarks = bookmarkEntityToKoboBookmark(bookmarks, chapters, koboBookChapters);
    const koboBook: KoboBook = {
      id: volumeId,
      info: bookInfoEntityToKoboBookInfo(bookInfo, chapters),
      chapters: koboBookChapters,
      bookmarks: koboBookmarks,
    };
    return koboBook;
  });
}

function bookmarkEntityToKoboBookmark(
  bookmarks: BookmarkEntity[],
  chapters: ChapterEntity[],
  koboBookChapters: KoboBookChapter[],
): KoboBookmark[] {
  const chapterIndexMap = indexBy(prop('index'), koboBookChapters);

  return bookmarks.map((bookmark) => {
    const relatedChapterEntities = findBookmarkChapters(bookmark, chapters);
    const relatedChapters = relatedChapterEntities.map((chapter) => chapterIndexMap[chapter.index]);
    const koboBookChapter = buildChapterInfoForBookmark(relatedChapters);
    const koboBook: KoboBookmark = {
      id: bookmark.id,
      text: prettifyBookmarkText(bookmark),
      annotation: bookmark.annotation,
      chapter: koboBookChapter,
      chapterProgress: bookmark.chapterProgress,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
    };
    return koboBook;
  });
}

function findBookmarkChapters(bookmark: BookmarkEntity, chapters: ChapterEntity[]): ChapterEntity[] {
  let relatedChapters: ChapterEntity[] = chapters.filter(
    (chapter) => chapter.chapterIdBookmarked === bookmark.contentId,
  );
  if (!relatedChapters.length) {
    relatedChapters = chapters.filter((chapter) => {
      const contentId = chapter.contentId.replace(/-\d{0,3}$/g, '');
      return contentId === bookmark.contentId;
    });
  }
  return relatedChapters;
}

function buildChapterInfoForBookmark(relatedChapters: KoboBookChapter[]): KoboBookmarkChapter {
  return {
    titles: relatedChapters.map((chapter) => chapter.title),
    relatedChapters,
    parentChapters: getParentChaptersOfChapter(relatedChapters),
  };
}

function getParentChaptersOfChapter(relatedChapters: KoboBookChapter[]): KoboBookChapter[] {
  if (relatedChapters.length === 0) {
    return [];
  }
  let chapter = relatedChapters[0];
  const chapters: KoboBookChapter[] = [];
  while (chapter.parentChapter) {
    chapters.push(chapter.parentChapter);
    chapter = chapter.parentChapter;
  }
  return chapters.toReversed();
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
  let currentParentChapterEntity = chapters[0];
  let currentParentKoboChapter: KoboBookChapter | undefined;
  return chapters.map((chapter) => {
    const koboChapter: KoboBookChapter = {
      title: chapter.title,
      index: chapter.index,
    };
    if (chapter.depth > currentParentChapterEntity.depth) {
      koboChapter.parentChapter = currentParentKoboChapter;
    } else if (currentParentChapterEntity.depth === chapter.depth) {
      currentParentChapterEntity = chapter;
      currentParentKoboChapter = koboChapter;
    }
    return koboChapter;
  });
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
    series: book?.series,
    isbn: book?.isbn,
    imageId: book?.imageId,
    isSideLoaded: book?.id.startsWith('file') || true,
    dateLastRead: book?.dateLastRead,
    dateAdded: book?.dateAdded,
  };
}
