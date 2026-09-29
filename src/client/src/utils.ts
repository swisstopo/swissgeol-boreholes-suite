export function capitalizeFirstLetter(text: string | undefined) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const getImageFromBlob = (blob: Blob) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

export const formatDate = (date: string | Date | null | undefined, withTime = false) => {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return new Intl.DateTimeFormat("de-CH", options).format(new Date(date));
};

/**
 * Schedules `callback` for the next idle period, falling back to a timer on browsers without
 * `requestIdleCallback`. Safari ships the API behind a feature flag, so it is absent there by
 * default and referencing it unguarded throws. Returns a function that cancels the pending callback.
 */
export const runWhenIdle = (callback: () => void, timeout: number) => {
  // Both globals sit behind the same browser flag but are separate bindings, so scheduling
  // through one and cancelling through the other requires proving that both exist.
  if (typeof requestIdleCallback === "function" && typeof cancelIdleCallback === "function") {
    const handle = requestIdleCallback(callback, { timeout });
    return () => cancelIdleCallback(handle);
  }

  const handle = setTimeout(callback, timeout);
  return () => clearTimeout(handle);
};
