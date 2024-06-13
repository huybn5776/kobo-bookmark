import { computed, ref, ComputedRef, Ref } from 'vue';

import { useNotification } from 'naive-ui';

import { useCheckNotionToken } from '@/composition/use-check-notion-token';
import { KoboBook } from '@/dto/kobo-book';
import { BookExportTask, BookExportState } from '@/interface/book-export-task';
import { bookmarkToText, bookmarkToMarkdown } from '@/services/export/bookmark-export.service';
import { handleNotionApiError } from '@/services/notion/notion-api-error-handing.service';
import { exportBookBookmarks } from '@/services/notion/notion-export.service';
import { textToFileDownload } from '@/util/browser-utils';

export function useBookmarkExport({
  selectedBooks,
  updateBookById,
}: {
  selectedBooks: Ref<KoboBook[]>;
  updateBookById: (bookId: string, updater: (book: KoboBook) => KoboBook) => void;
}): {
  exportingBookIds: ComputedRef<string[]>;
  bookExportTasksToShow: ComputedRef<BookExportTask[]>;
  exportBookmarkToNotion: (book: KoboBook) => Promise<void>;
  exportBookmarkToText: (book: KoboBook) => void;
  exportBookmarkToMarkdown: (book: KoboBook) => void;
  exportSelectedToNotion: () => void;
  cancelTask: (exportTask: BookExportTask) => void;
  discardAllTasks: () => void;
} {
  const notification = useNotification();
  const { checkIsNotionReady } = useCheckNotionToken();

  const bookExportTasks = ref<BookExportTask[]>([]);
  const lastTaskId = ref<number>(0);
  const pendingExportRequest = ref<Promise<void>>();

  const exportingBookIds = computed(() => {
    return bookExportTasks.value
      .filter((task) => task.state === BookExportState.Pending || task.state === BookExportState.Running)
      .map((task) => task.book.id);
  });
  const bookExportTasksToShow = computed(() =>
    bookExportTasks.value.toReversed().filter((task) => task.hidden !== true),
  );

  async function exportBookmarkToNotion(book: KoboBook): Promise<void> {
    if (!checkIsNotionReady()) {
      return;
    }
    const task: BookExportTask = { id: (lastTaskId.value += 1), book, state: BookExportState.Pending };
    bookExportTasks.value.push(task);

    if (pendingExportRequest.value) {
      return;
    }
    pendingExportRequest.value = tryExportBookmark(book, task);
    await pendingExportRequest.value;
    pendingExportRequest.value = undefined;
  }

  function exportBookmarkToText(book: KoboBook): void {
    const content = bookmarkToText([book]);
    textToFileDownload(content, `${book.info.title}.txt`, 'text/plain');
  }

  function exportBookmarkToMarkdown(book: KoboBook): void {
    const content = bookmarkToMarkdown([book]);
    textToFileDownload(content, `${book.info.title}.md`, 'text/markdown');
  }

  function exportSelectedToNotion(): void {
    if (!checkIsNotionReady()) {
      return;
    }
    selectedBooks.value.forEach((book) => exportBookmarkToNotion(book));
  }

  async function tryExportBookmark(book: KoboBook, task: BookExportTask): Promise<void> {
    try {
      const notionExportState = await exportBookBookmarks(book, task, (updatedTask) => {
        const currentTask = getTaskById(task);
        if (currentTask?.state === BookExportState.Canceled) {
          throw new Error('Task canceled');
        }
        updateTask(updatedTask);
      });
      updateBookById(book.id, (b) => ({ ...b, notion: notionExportState }));
    } catch (e) {
      const currentTask = getTaskById(task);
      if (currentTask?.state !== BookExportState.Canceled) {
        console.error(e);
        const errorMessage = handleNotionApiError(e as Error);
        notification.destroyAll();
        notification.error({ title: `Fail to export book to Notion: '${book.info.title}'`, content: errorMessage });
      }
    }
    await runNextTask();
  }

  async function runNextTask(): Promise<void> {
    const firstPendingTask = bookExportTasks.value.find((task) => task.state === BookExportState.Pending);
    if (!firstPendingTask) {
      return;
    }
    await tryExportBookmark(firstPendingTask.book, firstPendingTask);
  }

  function updateTask(exportTask: BookExportTask): void {
    const taskIndex = bookExportTasks.value.findIndex((task) => task.id === exportTask.id);
    if (taskIndex === -1) {
      return;
    }
    bookExportTasks.value[taskIndex] = exportTask;
  }

  function getTaskById(exportTask: BookExportTask): BookExportTask | undefined {
    return bookExportTasks.value.find((task) => task.id === exportTask.id);
  }

  function cancelTask(exportTask: BookExportTask): void {
    const currentTask = bookExportTasks.value.find((task) => task.id === exportTask.id);
    if (!currentTask) {
      return;
    }
    updateTask({ ...currentTask, state: BookExportState.Canceled });
  }

  function discardAllTasks(): void {
    for (let i = 0; i < bookExportTasks.value.length; i += 1) {
      const task = bookExportTasks.value[i];
      const updatedTask = { ...task };
      if (task.state === BookExportState.Pending || task.state === BookExportState.Running) {
        updatedTask.state = BookExportState.Canceled;
      }
      updatedTask.hidden = true;
      bookExportTasks.value[i] = updatedTask;
    }
  }

  return {
    exportingBookIds,
    bookExportTasksToShow,
    exportBookmarkToText,
    exportBookmarkToMarkdown,
    exportBookmarkToNotion,
    exportSelectedToNotion,
    cancelTask,
    discardAllTasks,
  };
}
