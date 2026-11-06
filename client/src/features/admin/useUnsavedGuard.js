import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

// Leaving a form with unsaved changes asks first. Used by every dashboard editor.
//   blocker      - show a "Leave without saving?" dialog while blocker.state === 'blocked'
//   allowLeave   - set allowLeave.current = true right before a navigation you WANT (after a save or delete),
//                  so the guard steps aside
export function useUnsavedGuard(isDirty) {
  const allowLeave = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault(); // closing the tab or reloading: the browser shows its own warning
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  return { blocker, allowLeave };
}
