import type { TFunction } from "i18next";
import { formatBytes } from "../api/transferProgress.ts";

/** Where a running upload has got to: its place in the batch, and the bytes it has sent. */
interface UploadProgressPlace {
  current: number;
  count: number;
  transferred: number;
  total?: number;
}

/**
 * The line shown under the name of the file being uploaded.
 *
 * The size is named only where the transport reported one, because a chunked upload does not
 * always know what it is sending up front.
 * @param t The translation function of the caller.
 * @param place Where the upload has got to.
 * @returns The translated hint.
 */
export const uploadProgressHint = (
  t: TFunction,
  { current, count, transferred, total }: UploadProgressPlace,
): string =>
  total === undefined
    ? t("uploadProgressHint", { current, total: count })
    : t("uploadProgressHintWithSize", {
        current,
        total: count,
        transferred: formatBytes(transferred),
        size: formatBytes(total),
      });
