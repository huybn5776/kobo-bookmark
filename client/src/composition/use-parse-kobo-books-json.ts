import { h } from 'vue';

import { useNotification } from 'naive-ui';
import { path, isNil } from 'ramda';
import { useI18n } from 'vue-i18n';
import { ZodError } from 'zod';

import MultiLineText from '@/component/MultiLineText/MultiLineText.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import { koboBookSchema } from '@/schema/kobo-book-schema';

export function useParseKoboBooksJson(): { parseBooksJson: (json: string) => Promise<KoboBook[] | null> } {
  const { t } = useI18n<[I18NMessageSchema]>();
  const notification = useNotification();

  async function parseBooksJson(json: string): Promise<KoboBook[] | null> {
    let jsonArray: [];
    try {
      jsonArray = JSON.parse(json) as [];
    } catch (e) {
      notification.error({
        title: t('page.settings.backup.fail_to_import_books'),
        content: t('page.settings.backup.json_parse_error'),
      });
      return null;
    }
    if (!Array.isArray(jsonArray)) {
      notification.error({
        title: t('page.settings.backup.fail_to_import_books'),
        content: t('page.settings.backup.data_structure_error'),
      });
      return null;
    }

    const books: KoboBook[] = [];
    for (const jsonObject of jsonArray) {
      try {
        const book = koboBookSchema.parse(jsonObject) as KoboBook;
        book.isArchived = 0;
        books.push(book);
      } catch (e) {
        handleBookSchemaParseError(jsonObject, e as ZodError);
        return null;
      }
    }
    return books;
  }

  function handleBookSchemaParseError(book: KoboBook, zodError: ZodError): void {
    if (!book?.info?.title) {
      notification.error({
        title: t('page.settings.backup.fail_to_import_books'),
        content: t('page.settings.backup.data_structure_error'),
      });
      return;
    }

    const detailMessages = zodErrorToMessages(zodError, book);
    notification.error({
      title: t('page.settings.backup.fail_to_import_books'),
      content: t('page.settings.backup.invalid_book_data', [book.info.title]),
      meta: () => h(MultiLineText, { texts: detailMessages }),
    });
  }

  function zodErrorToMessages(zodError: ZodError, obj: unknown): string[] {
    return zodError.errors.map((error) => {
      const value = path(error.path, obj);
      return `Field: "${error.path.join('.')}"${isNil(value) ? '' : ` = ${value}`}. ${error.message}`;
    });
  }

  return { parseBooksJson };
}
