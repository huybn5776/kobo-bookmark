import { KoboBook, KoboBookmark } from '@/dto/kobo-book';

export function removeUnnecessaryPropsFromBookForShare(book: KoboBook): KoboBook {
  const updatedBook = { ...book };
  delete updatedBook.info.timeSpentReading;
  delete updatedBook.info.imageId;
  delete updatedBook.info.fileSize;
  delete updatedBook.info.createdAt;
  updatedBook.bookmarks = updatedBook.bookmarks.map(removeUnnecessaryPropsFromBookmark);
  return updatedBook;
}

export function removeUnnecessaryPropsFromBookmark(bookmark: KoboBookmark): KoboBookmark {
  const updatedBookmark = { ...bookmark };
  delete updatedBookmark.isArchived;
  return updatedBookmark;
}
