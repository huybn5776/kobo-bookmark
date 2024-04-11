import { isNil } from 'ramda';

export function getFromStorage<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (value?.startsWith('[') || value?.startsWith('{')) {
    return JSON.parse(value);
  }
  if (value === 'true') {
    return true as T;
  }
  if (value === 'false') {
    return false as T;
  }
  return value as T;
}

export function saveToStorage<T>(key: string, value: T | null): void {
  if (typeof value === 'object') {
    localStorage.setItem(key.toString(), JSON.stringify(value));
  } else if (isNil(value)) {
    localStorage.removeItem(key.toString());
  } else {
    localStorage.setItem(key.toString(), `${value}`);
  }
}

export function updateFromStorage<T>(
  key: string,
  updater: (value: T | null) => T | null,
): { updated: boolean; value: T | null } {
  const settingValue = getFromStorage<T>(key);
  const updatedValue = updater(settingValue);
  if (settingValue === updatedValue) {
    return { updated: false, value: settingValue };
  }
  saveToStorage(key, updatedValue);
  return { updated: true, value: updatedValue };
}

export function deleteFromStorage(key: string): void {
  localStorage.removeItem(key);
}
