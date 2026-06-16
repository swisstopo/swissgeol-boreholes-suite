import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AlertContext } from "../components/alert/alertContext.tsx";

/**
 * Copies text to the system clipboard and reports the outcome through the global alert banner:
 * an info alert on success, an error alert on failure.
 */
export function useCopyToClipboard() {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);

  return useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showAlert(t("copiedToClipboard"), "info", true, "outlined");
      } catch {
        showAlert(t("errorCopyingToClipboard"), "error");
      }
    },
    [showAlert, t],
  );
}
