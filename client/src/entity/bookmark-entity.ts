export interface BookmarkEntity {
  id: string;
  volumeId: string;
  contentId: string;
  text: string;
  chapterProgress: number;
  createdAt: Date;
  updatedAt: Date;
}
