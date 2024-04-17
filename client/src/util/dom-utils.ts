export function scrollToElementIfNotInView(element: HTMLElement): void {
  if (element.getBoundingClientRect().bottom > window.innerHeight || element.getBoundingClientRect().top < 0) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
