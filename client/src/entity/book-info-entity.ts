export interface BookInfoEntity {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description?: string;
  publisher?: string;
  series?: string;
  isbn?: string;
  timeSpentReading?: number;
  imageId?: string;
  fileSize?: number;
  lastReadAt?: Date;
  createdAt?: Date;
}
