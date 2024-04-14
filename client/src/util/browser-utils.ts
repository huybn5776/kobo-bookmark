export function textToFileDownload(text: string, filename: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });
}

export function textToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export async function readBlobAsJson<T>(file: Blob): Promise<T> {
  const text = await readBlobAsText(file);
  return JSON.parse(text) as T;
}

export function readBlobAsText(file: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
      resolve(readerEvent.target?.result?.toString() || '');
    };
  });
}
