import { InjectionKey, ComputedRef } from 'vue';

import { BookCollection } from '@/dto/book-collection';

export const provideAllBookmarkTags: InjectionKey<ComputedRef<{ title: string; count: number }[]>> =
  Symbol('allBookmarkTags');
export const provideExpandedBookId: InjectionKey<ComputedRef<string | undefined>> = Symbol('expandedBookId');
export const provideActiveCollection: InjectionKey<ComputedRef<BookCollection | undefined>> =
  Symbol('activeCollection');
