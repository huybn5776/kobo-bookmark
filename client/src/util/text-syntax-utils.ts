import { sortBy, sum } from 'ramda';

import { SyntaxSegment } from '@/interface/syntax-segment';

type Range = { start: number; end: number };

export function toggleSyntax(sourceText: string, syntax: string, selectionStart: number, selectionEnd: number): string {
  const splits = sourceText.split(syntax);
  const originalText = splits.join('');
  let syntaxRanges = calcSyntaxRangesFromSplits(splits, syntax);
  const selectionRange = calcSelectionRange(sourceText, syntaxRanges, syntax, selectionStart, selectionEnd);
  syntaxRanges = processSyntax(syntaxRanges, selectionRange);
  return syntaxRangesToText(originalText, syntax, syntaxRanges);
}

function calcSyntaxRangesFromSplits(splits: string[], syntax: string): Range[] {
  let currentIndex = 0;
  let inSyntaxRange = splits[0].startsWith(syntax);
  let charOffset = 0;
  const syntaxRanges: Range[] = [];

  for (const split of splits) {
    if (inSyntaxRange) {
      const start = currentIndex - charOffset;
      const end = currentIndex - charOffset + split.length;
      charOffset += syntax.length * 2;

      syntaxRanges.push({ start, end });
      currentIndex += split.length + syntax.length * 2;
      inSyntaxRange = false;
    } else {
      currentIndex += split.length;
      inSyntaxRange = true;
    }
  }
  return syntaxRanges;
}

function calcSelectionRange(
  sourceText: string,
  syntaxRanges: Range[],
  syntax: string,
  selectionStart: number,
  selectionEnd: number,
): Range {
  const selectedText = sourceText.slice(selectionStart, selectionEnd);
  const start = selectedText.startsWith(syntax) ? selectionStart + syntax.length : selectionStart;
  const end = selectedText.endsWith(syntax) ? selectionEnd - syntax.length : selectionEnd;

  const startOffsetMultiplier = sum(
    syntaxRanges.map((range, i) => {
      const rangeStart = range.start + syntax.length * 2 * i;
      const rangeEnd = range.end + syntax.length * 2 * (i + 1);
      if (rangeEnd <= start) {
        return 2;
      }
      if (rangeStart <= start) {
        return 1;
      }
      return 0;
    }),
  );
  const endOffsetMultiplier =
    startOffsetMultiplier +
    sum(
      syntaxRanges.map((range, i) => {
        const rangeStart = range.start + syntax.length * 2 * i;
        const rangeEnd = range.end + syntax.length * 2 * (i + 1);
        const intersect = (rangeStart <= start && start < rangeEnd) || (rangeStart < end && end <= rangeEnd);
        if (intersect) {
          return 1;
        }
        const includes = start <= rangeStart && end >= rangeEnd;
        if (includes) {
          return 2;
        }
        return 0;
      }),
    );
  return { start: start - startOffsetMultiplier * syntax.length, end: end - endOffsetMultiplier * syntax.length };
}

function processSyntax(originalSyntaxRanges: Range[], selectionRange: Range): Range[] {
  const syntaxRanges = [...originalSyntaxRanges];

  const containingSegment = syntaxRanges.find(
    (segment) => segment.start <= selectionRange.start && segment.end >= selectionRange.end,
  );
  if (containingSegment) {
    return syntaxRanges.filter((range) => range !== containingSegment);
  }

  const intersectRanges = syntaxRanges.filter(
    (range) =>
      (range.start <= selectionRange.start && selectionRange.start <= range.end) ||
      (range.start <= selectionRange.end && selectionRange.end <= range.end) ||
      (selectionRange.start <= range.start && selectionRange.end >= range.end),
  );
  if (intersectRanges.length) {
    const start = Math.min(...[...intersectRanges, selectionRange].map((range) => range.start));
    const end = Math.max(...[...intersectRanges, selectionRange].map((range) => range.end));
    const mergesRange: Range = { start, end };
    return replaceArrayItem(syntaxRanges, intersectRanges, mergesRange);
  }

  if (selectionRange.start !== selectionRange.end) {
    return sortBy((range) => range.start, [...syntaxRanges, selectionRange]);
  }

  return originalSyntaxRanges;
}

function replaceArrayItem<T>(targetArray: T[], itemsToRemove: T[], replace: T): T[] {
  const result = [...targetArray];
  const firstRemoveIndex = targetArray.indexOf(itemsToRemove[0]);
  result[firstRemoveIndex] = replace;
  result.splice(firstRemoveIndex + 1, itemsToRemove.length - 1);
  return result;
}

function syntaxRangesToText(originalText: string, syntax: string, ranges: Range[]): string {
  let result = originalText;
  let charOffset = 0;
  for (const range of ranges) {
    result = result.slice(0, range.start + charOffset) + syntax + result.slice(range.start + charOffset);
    charOffset += syntax.length;
    result = result.slice(0, range.end + charOffset) + syntax + result.slice(range.end + charOffset);
    charOffset += syntax.length;
  }
  return result;
}

export function toSyntaxSegment(text: string, syntax: string): SyntaxSegment[] {
  const splits = text.split(syntax);
  if (splits.length <= 2) {
    return [{ text }];
  }

  const segments = [];
  let inSyntax = false;
  for (const textSplit of splits) {
    if (inSyntax) {
      segments.push({ text: textSplit, inSyntax: true });
    } else {
      segments.push({ text: textSplit });
    }
    inSyntax = !inSyntax;
  }
  if (segments[segments.length - 1].inSyntax && !text.endsWith(syntax)) {
    segments[segments.length - 1].inSyntax = false;
  }

  return segments;
}
