export interface KoboBooksSearchResult {
  Items: KoboBookSearchItems[];
  count: number;
  first: number;
  hits: number;
  last: number;
  page: number;
  pageCount: number;
}

export interface KoboBookSearchItems {
  Item: KoboBookSearchItem;
}

export interface KoboBookSearchItem {
  affiliateUrl: string;
  author: string;
  authorKana: string;
  itemCaption: string;
  itemNumber: string;
  itemPrice: number;
  itemUrl: string;
  koboGenreId: string;
  language: string;
  largeImageUrl: string;
  mediumImageUrl: string;
  publisherName: string;
  reviewAverage: string;
  reviewCount: number;
  salesDate: string;
  salesType: number;
  seriesName: string;
  smallImageUrl: string;
  subTitle: string;
  title: string;
  titleKana: string;
}
