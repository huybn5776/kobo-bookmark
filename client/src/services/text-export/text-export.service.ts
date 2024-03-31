import { KoboBook } from '@/dto/kobo-book';
import { chapterTitleToText } from '@/services/bookmark/bookmark-format.service';

export function bookmarkToTextList(books: KoboBook[]): string {
  return books
    .map((book) => {
      const title = `${book.info.title}`;
      const bookmarksText = book.bookmarks.map((bookmark) => `- ${bookmark.text}`).join('\n');
      return `${title}\n\n${bookmarksText}`;
    })
    .join('\n\n---\n\n');
}

export function bookmarkToTextParagraph(books: KoboBook[]): string {
  return books
    .map((book) => {
      const title = `${book.info.title}`;
      const bookmarksText = book.bookmarks
        .map((bookmark) => {
          const chapterText = chapterTitleToText(bookmark.chapter);
          const annotationText = bookmark.annotation ? `\n\n> ${bookmark.annotation}` : '';
          return `${chapterText}\n\n${bookmark.text}${annotationText}`;
        })
        .join('\n\n-\n\n');
      return `${title}\n\n-\n\n${bookmarksText}`;
    })
    .join('\n\n---\n\n');
}
