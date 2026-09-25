import { useEffect } from 'react';

import { activatesNatively, isEditable, isInNativeScroll, isInSwipeArea } from './dom';
import { pollGamepads } from './gamepad';
import type { Intent } from './intents';
import { keyToIntent } from './keyboard';
import { createSwipeTracker } from './swipe';
import { createWheelTranslator } from './wheel';

type Dispatch = (intent: Intent) => boolean;

/** Attaches every input device to `dispatch`. Mouse hover and clicks are handled by the elements. */
export function useInputSources(dispatch: Dispatch): void {
  useKeyboard(dispatch);
  useWheel(dispatch);
  useSwipe(dispatch);
  useGamepad(dispatch);
}

function useKeyboard(dispatch: Dispatch) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isEditable(event.target)) return;
      const intent = keyToIntent(event.key);
      if (!intent) return;
      // Let the browser click focused links and buttons: modifier keys and assistive tech keep working.
      if (intent.type === 'confirm' && activatesNatively(event.target, event.key)) return;
      if (dispatch(intent)) event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dispatch]);
}

function useWheel(dispatch: Dispatch) {
  useEffect(() => {
    const translate = createWheelTranslator();
    const onWheel = (event: WheelEvent) => {
      // Ctrl+wheel is browser zoom.
      if (event.ctrlKey || isInNativeScroll(event.target)) return;
      const intent = translate(event);
      if (intent) dispatch(intent);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, [dispatch]);
}

function useSwipe(dispatch: Dispatch) {
  useEffect(() => {
    const tracker = createSwipeTracker();
    let pointerId: number | null = null;
    let suppressClickUntil = 0;

    const onDown = (event: PointerEvent) => {
      // Any new press is a new gesture: its click belongs to it, not to the previous swipe.
      suppressClickUntil = 0;
      if (event.pointerType === 'mouse' || !event.isPrimary || !isInSwipeArea(event.target)) return;
      pointerId = event.pointerId;
      tracker.start(event.clientX, event.clientY);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      for (const intent of tracker.move(event.clientX, event.clientY)) dispatch(intent);
    };
    const onEnd = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (tracker.end()) suppressClickUntil = event.timeStamp + 350;
    };
    // A swipe that ends on an item shouldn't also open it.
    const onClick = (event: MouseEvent) => {
      if (event.timeStamp < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    window.addEventListener('click', onClick, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('click', onClick, { capture: true });
    };
  }, [dispatch]);
}

function useGamepad(dispatch: Dispatch) {
  useEffect(() => ('getGamepads' in navigator ? pollGamepads(dispatch) : undefined), [dispatch]);
}
