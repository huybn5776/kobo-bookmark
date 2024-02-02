import * as R from 'ramda';

export const isNilOrEmpty = R.either(R.isEmpty, R.isNil) as (value: unknown) => value is null | undefined;
export function isNotNilOrEmpty<T>(value: T | null | undefined): value is T {
  return !isNilOrEmpty(value);
}

export function isNotNil<T>(value: T | null | undefined): value is T {
  return !R.isNil(value);
}

export function isNestedEmpty<T extends object>(value: T | null | undefined): boolean {
  if (isNilOrEmpty(value)) {
    return true;
  }
  if (typeof value !== 'object' && !Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((v) => isNilOrEmpty(v) && isNestedEmpty(v));
}
