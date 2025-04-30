import { useCallback, useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import { PromptContext } from "../components/prompt/promptContext.tsx";
import { SaveContext, SaveContextProps } from "../pages/detail/saveContext.tsx";

export const useBlockNavigation = () => {
  const { hasChanges } = useContext<SaveContextProps>(SaveContext);
  const { showPrompt } = useContext(PromptContext);
  const { t } = useTranslation();
  const promptShownRef = useRef(false);

  const shouldBlock = useCallback(() => {
    return hasChanges;
  }, [hasChanges]);

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === "blocked" && !promptShownRef.current) {
      promptShownRef.current = true;
      showPrompt(t("messageDiscardUnsavedChanges"), [
        {
          dataCy: "cancel-button",
          label: t("cancel"),
          icon: <X />,
          variant: "outlined",
          action: () => {
            blocker.reset?.();
            setTimeout(() => {
              promptShownRef.current = false; // avoids duplicate prompts with async state
            }, 0);
          },
        },
        {
          dataCy: "discardchanges-button",
          label: t("discardchanges"),
          icon: <Trash2 />,
          variant: "contained",
          action: () => {
            blocker.proceed?.();
            setTimeout(() => {
              promptShownRef.current = false;
            }, 0);
          },
        },
      ]);
    }
  }, [blocker, hasChanges, showPrompt, t]);
};
