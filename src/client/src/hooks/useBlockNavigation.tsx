import { useCallback, useContext, useEffect, useRef } from "react";
import { useBlocker } from "react-router";
import { Trash2, X } from "lucide-react";
import { PromptContext } from "../components/prompt/promptContext.tsx";
import { SaveContext, SaveContextProps } from "../pages/detail/saveContext.tsx";

export const useBlockNavigation = () => {
  const { hasChanges } = useContext<SaveContextProps>(SaveContext);
  const { showPrompt } = useContext(PromptContext);
  const promptShownRef = useRef(false);

  const shouldBlock = useCallback(() => {
    return hasChanges;
  }, [hasChanges]);

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === "blocked" && !promptShownRef.current && hasChanges) {
      promptShownRef.current = true;
      showPrompt("messageDiscardUnsavedChanges", [
        {
          label: "cancel",
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
          label: "discardchanges",
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
    } else if (blocker.state === "blocked" && !hasChanges) {
      // If there are no changes, don't block the navigation. This check is necessary because sometimes the blocker
      // is not yet reset even though the changes are gone.
      blocker.proceed?.();
    }
  }, [blocker, hasChanges, showPrompt]);
};
