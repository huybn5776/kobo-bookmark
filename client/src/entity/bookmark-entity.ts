export interface BookmarkEntity {
  id: string;
  volumeId: string;
  contentId: string;
  text: string;
  annotation?: string;
  chapterProgress: number;
  startContainerPath: string;
  endContainerPath: string;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}
