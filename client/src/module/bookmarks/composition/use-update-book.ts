/* eslint-disable no-param-reassign */
import { Ref } from 'vue';

import { KoboBook } from '@/dto/kobo-book';
import { putBooksToDb, getBooksFromDb } from '@/services/bookmark/bookmark-manage.service';
import { deepToRaw } from '@/util/vue-utils';

export function useUpdateBook({
  allBooks,
  keepSortingOnce,
}: {
  allBooks: Ref<KoboBook[]>;
  keepSortingOnce: () => void;
}): {
  toggleBookStar: (book: KoboBook) => Promise<void>;
  updateBookCoverImage: (book: KoboBook, coverImageUrl: string) => Promise<void>;
  updateBookById: (bookId: string, updater: (book: KoboBook) => KoboBook) => void;
} {
  function updateBookById(bookId: string, updater: (book: KoboBook) => KoboBook): void {
    const currentBooks = allBooks.value || [];
    const indexOfBookToUpdate = currentBooks.findIndex((b) => b.id === bookId);
    if (indexOfBookToUpdate === -1) {
      return;
    }
    const updatedBooks = [...currentBooks];
    let targetBook = updatedBooks[indexOfBookToUpdate];
    targetBook = updater(targetBook);
    updatedBooks[indexOfBookToUpdate] = targetBook;
    allBooks.value = updatedBooks;
    putBooksToDb([deepToRaw(targetBook)]);
  }

  async function toggleBookStar(book: KoboBook): Promise<void> {
    updateBookById(book.id, (originalBook) => {
      const tags = { ...(book.tags ?? {}) };
      if (tags.star) {
        delete tags.star;
      } else {
        tags.star = true;
      }
      const updatedBook = { ...originalBook };
      if (Object.keys(tags).length) {
        updatedBook.tags = tags;
      } else {
        delete updatedBook.tags;
      }

      const targetBookIndex = allBooks.value.findIndex((b) => b.id === book.id);
      if (targetBookIndex !== -1) {
        allBooks.value[targetBookIndex] = updatedBook;
      }
      return updatedBook;
    });
    allBooks.value = await getBooksFromDb();
    keepSortingOnce();
  }

  async function updateBookCoverImage(book: KoboBook, coverImageUrl: string): Promise<void> {
    updateBookById(book.id, (b) => ({ ...b, coverImageUrl }));
    allBooks.value = await getBooksFromDb();
  }

  return { updateBookById, toggleBookStar, updateBookCoverImage };
}
