import { useEffect, useState } from "react";

/**
 * Reports whether `active` has stayed true continuously for at least `delayMs`.
 *
 * Useful for progress hints that should only appear once an operation is running unusually long:
 * short operations never flip the flag, so the UI stays quiet in the common case. The flag resets
 * as soon as `active` turns false, and the pending timer is cleared on unmount.
 */
export const useDelayedFlag = (active: boolean, delayMs: number): boolean => {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) {
      setElapsed(false);
      return;
    }
    const timeout = setTimeout(() => setElapsed(true), delayMs);
    return () => clearTimeout(timeout);
  }, [active, delayMs]);

  return elapsed;
};
