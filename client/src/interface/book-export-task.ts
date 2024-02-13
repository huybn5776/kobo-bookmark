import { KoboBook } from '@/dto/kobo-book';

export interface BookExportTask {
  id: number;
  book: KoboBook;
  state: BookExportState;
  percentage?: number;
  step?: number;
  totalStep?: number;
  stage?: BookExportStage;
  hidden?: boolean;
}

export enum BookExportState {
  Pending = 'pending',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Canceled = 'canceled',
}

export enum BookExportStage {
  CheckingTargetPage = 'checking-target-page',
  CreatePage = 'create-page',
  UpdatePage = 'update-page',
  AddBlocks = 'add-blocks',
  CleanupPage = 'cleanup-page',
}
