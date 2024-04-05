export function tryParseUrl(urlString: string): URL | null {
  try {
    const url = new URL(urlString);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url;
    }
  } catch (_) {
    return null;
  }
  return null;
}
