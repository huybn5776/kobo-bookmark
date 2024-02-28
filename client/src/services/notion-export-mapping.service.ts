import type {
  UpdatePageParameters,
  CreatePageParameters,
  BlockObjectRequest,
} from '@notionhq/client/build/src/api-endpoints';
import { maxBy } from 'ramda';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';

export function bookToNotionUpdatePageParams(
  book: KoboBook,
): Omit<UpdatePageParameters, 'page_id'> & Required<Pick<UpdatePageParameters, 'properties'>> {
  const pageParams: ReturnType<typeof bookToNotionUpdatePageParams> = {
    properties: {
      title: [{ text: { content: book.info.title || '' } }],
    },
  };
  if (book.coverImageUrl) {
    const url = new URL(book.coverImageUrl);
    url.searchParams.set('kobo-bookmark-book-id', book.id);
    const urlWithBookId = url.toString();
    const image: { external: { url: string }; type?: 'external' } = {
      type: 'external',
      external: { url: urlWithBookId },
    };
    pageParams.cover = image;
    pageParams.icon = image;
  }
  return pageParams;
}

export function bookToNotionDatabasePageProperties(book: KoboBook): CreatePageParameters['properties'] {
  const { title, author, publisher, isbn } = book.info;
  const lastBookmarkedTime = book.bookmarks.reduce(maxBy((bookmark) => bookmark.createdAt)).createdAt;
  const updateTime = book.info.dateLastRead;

  return {
    ...(title ? { Title: { title: [{ text: { content: title } }] } } : {}),
    ...(author ? { Author: { rich_text: [{ text: { content: author } }] } } : {}),
    ...(publisher ? { Publisher: { rich_text: [{ text: { content: publisher } }] } } : {}),
    ...(isbn ? { ISBN: { rich_text: [{ text: { content: isbn } }] } } : {}),
    'Last bookmarked time': { date: { start: lastBookmarkedTime.toISOString() } },
    ...(updateTime ? { 'Update time': { date: { start: updateTime.toISOString() } } } : {}),
    'Book id': { rich_text: [{ text: { content: book.id } }] },
  };
}

export function bookmarksToNotionBlocks(bookmarks: KoboBookmark[]): BlockObjectRequest[] {
  const divider: BlockObjectRequest = { object: 'block', type: 'divider', divider: {} };
  return bookmarks.flatMap((bookmark, index) => {
    const chapterText =
      bookmark.chapter.parentChapters.map((chapter) => `${chapter.title} > `) + bookmark.chapter.titles.join(' - ');
    const chapterBlock: BlockObjectRequest = {
      paragraph: {
        rich_text: [{ text: { content: chapterText } }],
        color: 'gray_background',
      },
    };
    const textBlock: BlockObjectRequest = {
      paragraph: {
        rich_text: [{ text: { content: bookmark.text } }],
      },
    };
    const blocks: BlockObjectRequest[] = [chapterBlock, textBlock];
    if (bookmark.annotation) {
      blocks.push({
        quote: {
          rich_text: [{ type: 'text', text: { content: bookmark.annotation } }],
        },
      });
    }

    if (index !== 0) {
      blocks.unshift(divider);
    }
    return blocks;
  });
}
