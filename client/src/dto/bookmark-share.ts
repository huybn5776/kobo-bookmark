import { KoboBook } from '@/dto/kobo-book';

export interface BookmarkShare {
  title?: string;
  description?: string;
  books: KoboBook[];
  createdAt: Date;
}
