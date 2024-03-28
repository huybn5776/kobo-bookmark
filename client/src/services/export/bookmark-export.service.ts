import { KoboBook } from '@/dto/kobo-book';
import { MarkdownExportMode } from '@/enum/markdown-export-mode';
import { SettingKey } from '@/enum/setting-key';
import { TextExportMode } from '@/enum/text-export-mode';
import { bookmarkToMarkdownList, bookmarkToMarkdownParagraph } from '@/services/makrdown/markdown-export.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { bookmarkToTextList, bookmarkToTextParagraph } from '@/services/text-export/text-export.service';

export function bookmarkToText(book: KoboBook): string {
  const mode = getSettingFromStorage(SettingKey.TextExportMode) || TextExportMode.Paragraph;
  switch (mode) {
    case TextExportMode.List:
      return bookmarkToTextList(book);
    case TextExportMode.Paragraph:
    default:
      return bookmarkToTextParagraph(book);
  }
}

export function bookmarkToMarkdown(book: KoboBook): string {
  const mode = getSettingFromStorage(SettingKey.MarkdownExportMode) || MarkdownExportMode.Paragraph;
  switch (mode) {
    case MarkdownExportMode.List:
      return bookmarkToMarkdownList(book);
    case MarkdownExportMode.Paragraph:
    default:
      return bookmarkToMarkdownParagraph(book);
  }
}
