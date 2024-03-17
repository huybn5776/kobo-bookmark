import initSqlJs, { SqlJsStatic, Database, SqlValue, QueryExecResult } from 'sql.js';

import sqliteUrl from '@/assets/wasm-files/sql-wasm.wasm?url';
import { BookmarkEntity, ChapterEntity } from '@/entity';
import { BookInfoEntity } from '@/entity/book-info-entity';

let sqlJs: SqlJsStatic | undefined;

export async function openDb(data?: ArrayLike<number> | Buffer | null): Promise<Database> {
  return new (await getSql()).Database(data);
}

export function getBookmarks(db: Database, bookIds?: string[]): BookmarkEntity[] {
  const sql = `
select BookmarkID, VolumeID, ContentId, Text, Annotation, ChapterProgress, StartContainerPath, EndContainerPath, DateCreated, DateModified
from Bookmark
where Type = 'highlight' or type = 'note'
`;
  let results: QueryExecResult[];
  if (bookIds?.length) {
    results = db.exec(`${sql} and VolumeId in (${bookIds.map(() => '?').join(',')})`, bookIds);
  } else {
    results = db.exec(sql);
  }

  return results[0].values.map((values: SqlValue[]) => {
    return {
      id: values[0] as string,
      volumeId: values[1] as string,
      contentId: values[2] as string,
      text: values[3] as string,
      annotation: values[4] as string,
      chapterProgress: values[5] as number,
      startContainerPath: values[6] as string,
      endContainerPath: values[7] as string,
      createdAt: new Date(values[8] as string),
      updatedAt: new Date(values[9] as string),
    };
  });
}

export function getBookChapters(db: Database, bookIds: string[]): ChapterEntity[] {
  const results = db.exec(
    `
select BookID,
       ContentId,
       ChapterIDBookmarked,
       BookTitle,
       Title,
       VolumeIndex,
       Depth
from content
where content.ContentType = 899
  and BookID in (${bookIds.map(() => '?').join(',')})
order by VolumeIndex`,
    bookIds,
  );
  return results[0].values.map((values: SqlValue[]) => {
    return {
      bookId: values[0] as string,
      contentId: values[1] as string,
      chapterIdBookmarked: values[2] as string,
      bookTitle: values[3] as string,
      title: values[4] as string,
      index: values[5] as number,
      depth: values[6] as number,
    };
  });
}

export function getBooksInfo(db: Database, bookIds: string[]): BookInfoEntity[] {
  const results = db.exec(
    `
select ContentID,
       Title,
       Subtitle,
       Attribution,
       Publisher,
       Series,
       Description,
       ISBN,
       TimeSpentReading,
       ImageId,
       ___FileSize,
       DateLastRead,
       DateCreated
from content
where ContentType = 6
  and ContentID in (${bookIds.map(() => '?').join(',')})
`,
    bookIds,
  );
  return results[0].values.map((values: SqlValue[]) => {
    return {
      id: values[0] as string,
      title: values[1] as string,
      subtitle: values[2] as string,
      author: values[3] as string,
      publisher: values[4] as string,
      series: values[5] as string,
      description: values[6] as string,
      isbn: values[7] as string,
      timeSpentReading: values[8] as number,
      imageId: values[9] as string,
      fileSize: values[10] as number,
      lastReadAt: new Date(values[11] as string),
      createdAt: new Date(values[12] as string),
    };
  });
}

async function getSql(): Promise<SqlJsStatic> {
  return sqlJs || (sqlJs = await initSqlJs({ locateFile: () => sqliteUrl }));
}
