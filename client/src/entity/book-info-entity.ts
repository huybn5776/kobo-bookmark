export interface BookInfoEntity {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description?: string;
  publisher?: string;
  isbn?: string;
  imageId?: string;
  dateLastRead?: Date;
}
