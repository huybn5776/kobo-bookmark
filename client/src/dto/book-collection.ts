export interface BookCollections {
  collections: BookCollection[];
  updatedAt: Date;
}

export interface BookCollection {
  id: string;
  name: string;
  bookIds: string[];
  updatedAt: Date;
}
