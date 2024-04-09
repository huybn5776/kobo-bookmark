import type {
  UpdatePageParameters,
  CreatePageParameters,
  BlockObjectRequest,
} from '@notionhq/client/build/src/api-endpoints';
import { maxBy } from 'ramda';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import { chapterTitleToText } from '@/services/bookmark/bookmark-format.service';

type BlockItem = Pick<Extract<BlockObjectRequest, { paragraph: unknown }>, 'paragraph'>;
type BulletedListItem = Pick<Extract<BlockObjectRequest, { bulleted_list_item: unknown }>, 'bulleted_list_item'>;
type BulletedListChildren = BulletedListItem['bulleted_list_item']['children'];

export function bookToNotionUpdatePageParams(
  book: KoboBook,
): Omit<UpdatePageParameters, 'page_id'> & Required<Pick<UpdatePageParameters, 'properties'>> {
  const pageParams: ReturnType<typeof bookToNotionUpdatePageParams> = {
    properties: {
      title: [{ text: { content: book.info.title || '' } }],
    },
  };
  if (book.coverImageUrl) {
    const image: { external: { url: string }; type?: 'external' } = {
      type: 'external',
      external: { url: book.coverImageUrl },
    };
    pageParams.cover = image;
    pageParams.icon = image;
  }
  return pageParams;
}

export function bookToNotionDatabasePageProperties(book: KoboBook): CreatePageParameters['properties'] {
  const { title, author, publisher, isbn } = book.info;
  const lastBookmarkedTime = book.bookmarks.reduce(maxBy((bookmark) => bookmark.createdAt)).createdAt;
  const updateTime = book.info.lastReadAt;

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

export function bookmarksToNotionPageBookDetail(book: KoboBook): BlockObjectRequest[] {
  const listBlocks: BulletedListChildren = [];
  if (book.info.author) {
    listBlocks.push({
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: `Author: ${book.info.author}` } }],
      },
    });
  }
  if (book.info.publisher) {
    listBlocks.push({
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: `Publisher: ${book.info.publisher}` } }],
      },
    });
  }
  if (!listBlocks.length) {
    return [];
  }
  const toggleBlock: BlockObjectRequest = {
    toggle: {
      rich_text: [{ type: 'text', text: { content: 'Book details' } }],
      children: listBlocks,
    },
  };
  const divider: BlockObjectRequest = { object: 'block', type: 'divider', divider: {} };
  return [toggleBlock, divider];
}

export function bookmarksToNotionBlocks(bookmarks: KoboBookmark[]): BlockObjectRequest[] {
  const divider: BlockObjectRequest = { object: 'block', type: 'divider', divider: {} };
  return bookmarks.flatMap((bookmark, index) => {
    const chapterText = chapterTitleToText(bookmark.chapter);
    const chapterBlock: BlockObjectRequest = {
      paragraph: {
        rich_text: [{ text: { content: chapterText } }],
        color: 'gray_background',
      },
    };
    const textBlock: BlockObjectRequest = {
      paragraph: {
        rich_text: [
          {
            text: { content: bookmark.text },
            annotations: { color: highlightColorToNotionTextColor(bookmark.color) },
          },
        ],
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

function highlightColorToNotionTextColor(color: HighlightColor | undefined): BlockItem['paragraph']['color'] {
  switch (color) {
    case HighlightColor.Yellow:
      return 'yellow_background';
    case HighlightColor.Red:
      return 'red_background';
    case HighlightColor.Green:
      return 'green_background';
    case HighlightColor.Blue:
      return 'blue_background';
    case HighlightColor.Pink:
      return 'pink_background';
    case HighlightColor.Purple:
      return 'purple_background';
    default:
      return undefined;
  }
}
