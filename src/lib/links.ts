/** Everything but `mailto:` links opens in a new tab, so the hub stays open. */
export function opensInNewTab(url: string): boolean {
  return !url.startsWith('mailto:');
}

/**
 * Opens a link from code (e.g. a gamepad press). Browsers block new tabs without a user gesture,
 * and gamepad input doesn't count as one, so a blocked new tab falls back to the current tab.
 */
export function openLink(href: string, newTab: boolean): void {
  if (newTab) {
    const opened = window.open('', '_blank');
    if (opened) {
      opened.opener = null;
      opened.location.href = href;
      return;
    }
  }
  window.location.assign(href);
}

/** Activates an element the way a click would, going through `openLink` for new-tab links. */
export function activateElement(element: Element | null): void {
  if (element instanceof HTMLAnchorElement) openLink(element.href, element.target === '_blank');
  else if (element instanceof HTMLElement) element.click();
}
