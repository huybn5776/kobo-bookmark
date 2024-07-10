import { toRaw, isRef, isReactive, isProxy, InjectionKey, inject } from 'vue';

export function deepToRaw<T extends object>(sourceObj: T): T {
  const objectIterator = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map((item) => objectIterator(item));
    }
    if (isRef(value) || isReactive(value) || isProxy(value)) {
      return objectIterator(toRaw(value));
    }
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      return Object.keys(value).reduce((acc, key) => {
        acc[key as keyof typeof acc] = objectIterator(value[key as keyof typeof value] as object) as T[keyof T];
        return acc;
      }, {} as T);
    }
    return value;
  };

  return objectIterator(sourceObj) as T;
}

export function injectStrict<T>(key: InjectionKey<T>): T {
  const resolved = inject(key, undefined);
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`);
  }
  return resolved;
}
