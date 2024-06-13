import { isUuid } from '@/util/id-utils';

const prefix = 'file:///mnt/onboard/';

export function encodeBookId(id: string): string {
  if (!id.startsWith(prefix)) {
    return id;
  }
  const firstIndexOfDot = id.indexOf('.');
  const pathPart = id.slice(0, firstIndexOfDot).replace(prefix, '');
  const extNamePart = btoa(encodeURIComponent(id.slice(firstIndexOfDot)));
  return `${pathPart}:${extNamePart}`;
}

export function decodeBookId(id: string): string {
  if (isUuid(id)) {
    return id;
  }
  const lastSplitCharIndex = id.lastIndexOf(':');
  const pathPart = id.slice(0, lastSplitCharIndex);
  const extNamePart = id.slice(lastSplitCharIndex + 1);
  return `${prefix}${pathPart}${decodeURIComponent(atob(extNamePart))}`;
}
