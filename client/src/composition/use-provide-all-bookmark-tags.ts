import { computed, provide, ComputedRef, Ref } from 'vue';

import { KoboBook } from '@/dto/kobo-book';
import { summarizeTagsOfBooks } from '@/services/tag/tag.service';
import { provideAllBookmarkTags } from '@/symbols';

export function useProvideAllBookmarkTags({ allBooks }: { allBooks: Ref<KoboBook[]> | ComputedRef<KoboBook[]> }): void {
  const allBookmarkTags = computed(() => summarizeTagsOfBooks(allBooks.value));
  provide(provideAllBookmarkTags, allBookmarkTags);
}
