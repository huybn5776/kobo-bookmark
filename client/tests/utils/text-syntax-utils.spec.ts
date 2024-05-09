import { toggleSyntax } from '@/util/text-syntax-utils';

const syntaxChar = '**';

describe('text-syntax', () => {
  it('add syntax char to text', () => {
    const actual = runTest(
      'The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.',
      'only way',
    );
    const expected =
      'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.';
    expect(actual).toBe(expected);
  });

  it('add syntax char to text that already have another syntax segment', () => {
    expect(
      runTest(
        'The only way to **become excellent** is to be endlessly fascinated by doing the same thing over and over.',
        'only way',
      ),
    ).toBe(
      'The **only way** to **become excellent** is to be endlessly fascinated by doing the same thing over and over.',
    );
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        'become excellent',
      ),
    ).toBe(
      'The **only way** to **become excellent** is to be endlessly fascinated by doing the same thing over and over.',
    );
  });

  it('remove syntax char', () => {
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        'only way',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        '**only way**',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        '**only way',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        'only way**',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        'only w',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
  });

  it('remove syntax char - partial select', () => {
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        'onl',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        'way',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        'nly',
      ),
    ).toBe('The only way to become excellent is to be endlessly fascinated by doing the same thing over and over.');
  });

  it('remove syntax char with multi syntax', () => {
    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by **doing the same** thing over and over.',
        'only way',
      ),
    ).toBe(
      'The only way to **become excellent** is to be endlessly fascinated by **doing the same** thing over and over.',
    );
    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by **doing the same** thing over and over.',
        'become excellent',
      ),
    ).toBe(
      'The **only way** to become excellent is to be endlessly fascinated by **doing the same** thing over and over.',
    );
    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by **doing the same** thing over and over.',
        'doing the same',
      ),
    ).toBe(
      'The **only way** to **become excellent** is to be endlessly fascinated by doing the same thing over and over.',
    );
  });

  it('extend syntax', () => {
    expect(
      runTest(
        'The **only way** to become excellent is to be endlessly fascinated by doing the same thing over and over.',
        '**only way** to become excellent',
      ),
    ).toBe('The **only way to become excellent** is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by doing the same thing over and over.',
        'way** to **become',
      ),
    ).toBe('The **only way to become excellent** is to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The only way to **become excellent** is to **be endlessly** fascinated by doing the same thing over and over.',
        'to **become excellent** is to **be endlessly** fascinated',
      ),
    ).toBe('The only way **to become excellent is to be endlessly fascinated** by doing the same thing over and over.');

    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by doing the same thing over and over.',
        'only way** to **become excellent** is',
      ),
    ).toBe('The **only way to become excellent is** to be endlessly fascinated by doing the same thing over and over.');
    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by **doing the same** thing over and over.',
        'only way** to **become excellent** is',
      ),
    ).toBe(
      'The **only way to become excellent is** to be endlessly fascinated by **doing the same** thing over and over.',
    );
    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by **doing the same** thing over and over.',
        'only way** to **become excellent** is to be endlessly fascinated by',
      ),
    ).toBe(
      'The **only way to become excellent is to be endlessly fascinated by** **doing the same** thing over and over.',
    );
    expect(
      runTest(
        'The **only way** to **become excellent** is to be endlessly fascinated by **doing the same** thing over and over.',
        'only way** to **become excellent** is to be endlessly fascinated by ',
      ),
    ).toBe('The **only way to become excellent is to be endlessly fascinated by doing the same** thing over and over.');
  });

  function runTest(sourceText: string, selectedText: string): string {
    const selectionStart = sourceText.indexOf(selectedText);
    const selectionEnd = selectionStart + selectedText.length;
    return toggleSyntax(sourceText, syntaxChar, selectionStart, selectionEnd);
  }
});
