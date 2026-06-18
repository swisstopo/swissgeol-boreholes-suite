import { RefObject } from "react";
import useResizeObserver, { UseResizeObserverCallback } from "@react-hook/resize-observer";

// React 19's `useRef<T>(null)` returns `RefObject<T | null>`, but `@react-hook/resize-observer`'s
// types still expect a `RefObject<T>` with a non-nullable inner type. This wrapper centralizes the
// cast so consumers don't repeat it at every observation site.
export const useTypedResizeObserver = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: UseResizeObserverCallback,
): void => {
  useResizeObserver(ref as RefObject<T>, callback);
};
