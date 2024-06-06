export function scrollToElementIfNotInView(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  if (element.getBoundingClientRect().bottom > window.innerHeight || element.getBoundingClientRect().top < 0) {
    element.scrollIntoView(options);
  }
}
