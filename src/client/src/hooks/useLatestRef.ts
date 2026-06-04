import { useRef } from "react";

/**
 * Keeps a ref pointing at the latest value on every render. Useful for reading current props or
 * callbacks from long-lived event listeners (e.g. installed once when a drag starts) without
 * re-wiring those listeners on every render.
 */
export const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};
