import { useEventListener } from '@vueuse/core';

export function useCmdEnterHotkey(callback: (event: KeyboardEvent) => void): void {
  useEventListener(document, 'keydown', (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key === 'Enter') {
      callback(event);
    }
  });
}
