export function formatDateToShortTimeString(date: Date): string {
  const dateString = `${`${date.getFullYear()}`.slice(2)}${`${date.getMonth() + 1}`.padStart(2, '0')}${`${date.getDate()}`.padStart(2, '0')}`;
  const timeString = `${`${date.getHours()}`.padStart(2, '0')}${`${date.getMinutes()}`.padStart(2, '0')}${`${date.getSeconds()}`.padStart(2, '0')}`;
  return dateString + timeString;
}

export function waitMilliseconds(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
