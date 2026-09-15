import { useEffect, useRef } from "react";

/**
 * Keeps a ref pointing at the latest committed value. Useful for reading current props or
 * callbacks from long-lived event listeners (e.g. installed once when a drag starts) without
 * re-wiring those listeners on every render.
 *
 * The update runs after commit, so the ref must only be read from listeners, effects and event
 * handlers, never during render.
 */
export const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
