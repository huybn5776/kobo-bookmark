import { KoboBook } from '@/dto/kobo-book';

export async function getBookCoverFromKoboBookInfo(book: KoboBook): Promise<string | null> {
  const { imageId } = book.info;
  if (book.info.isSideLoaded || !book.info.imageId) {
    return null;
  }
  const imageUrl = `https://cdn.kobo.com/book-images/${imageId}/-.jpg`;
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(imageUrl)}`;
  try {
    await fetch(proxyUrl);
    return proxyUrl;
  } catch (e) {
    return null;
  }
}
