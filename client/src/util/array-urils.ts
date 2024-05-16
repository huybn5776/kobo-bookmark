import { indexBy } from 'ramda';

export function sortByList<T>(
  sourceIdArray: (string | number)[],
  targetArray: T[],
  identityBy: (item: T) => string | number,
): T[] {
  const targetItemsMap = indexBy(identityBy, targetArray);
  const resultItems: T[] = [];

  for (const sourceId of sourceIdArray) {
    const targetItem = targetItemsMap[sourceId];
    if (targetItem) {
      resultItems.push(targetItem);
      delete targetItemsMap[sourceId];
    }
  }

  return [...resultItems, ...Object.values(targetItemsMap)];
}
