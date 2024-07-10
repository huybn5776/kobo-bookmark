import { InjectionKey, ComputedRef } from 'vue';

export const provideAllBookmarkTags: InjectionKey<ComputedRef<{ title: string; count: number }[]>> =
  Symbol('allBookmarkTags');
