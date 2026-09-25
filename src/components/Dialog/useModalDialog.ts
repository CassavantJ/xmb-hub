import { useEffectEvent, useLayoutEffect, type RefObject } from 'react';

/**
 * Shows a mounted <dialog> as a modal: native focus trap, inert page, top layer. The browser's
 * own dismissals (Esc, Android back) go to `onDismiss`, so React state stays the source of truth.
 * Focus moves to `initialFocus()` on open and back to the opener when the dialog unmounts.
 */
export function useModalDialog(
  ref: RefObject<HTMLDialogElement | null>,
  onDismiss: () => void,
  initialFocus?: () => HTMLElement | null | undefined,
): void {
  const dismiss = useEffectEvent(onDismiss);
  const focusInitial = useEffectEvent(() => initialFocus?.()?.focus());

  // Layout effect: open before paint, so the closed dialog never flashes in the page flow.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    focusInitial();

    const onCancel = (event: Event) => {
      event.preventDefault();
      dismiss();
    };
    dialog.addEventListener('cancel', onCancel);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.close();
      // The page stays inert until the dialog is gone, so restore focus on the next frame.
      requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      });
    };
  }, [ref]);
}
