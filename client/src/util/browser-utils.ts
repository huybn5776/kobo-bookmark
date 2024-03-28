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
