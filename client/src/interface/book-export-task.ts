import { KoboBook } from '@/dto/kobo-book';

export interface BookExportTask {
  id: number;
  book: KoboBook;
  state: BookExportState;
  percentage?: number;
  step?: number;
  totalStep?: number;
  stage?: BookExportStage;
}

export enum BookExportState {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Fail = 'fail',
}

export enum BookExportStage {
  CreatePage = 'create-page',
  UpdatePage = 'update-page',
  AddBlocks = 'add-blocks',
  CleanupPage = 'cleanup-page',
}
