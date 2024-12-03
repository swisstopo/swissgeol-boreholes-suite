import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { useFormDirty } from "./FormDirtyContext.tsx";

interface UseBlockNavigationResult {
  handleBlockedNavigation: (nextLocation: string) => boolean;
}

export const useBlockNavigation = (): UseBlockNavigationResult => {
  const [nextLocation, setNextLocation] = useState<string | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  const { isFormDirty } = useFormDirty();
  const { showPrompt } = useContext(PromptContext);
  const { t } = useTranslation();
  const history = useHistory();

  // Allow navigation after user confirms
  useEffect(() => {
    if (confirmedNavigation && nextLocation) {
      history.push(nextLocation);
    }
  }, [confirmedNavigation, nextLocation, history]);

  const handleBlockedNavigation = (nextLocation: string): boolean => {
    if (!confirmedNavigation && isFormDirty) {
      showPrompt(t("messageDiscardUnsavedChanges"), [
        {
          label: t("cancel"),
          icon: <X />,
          variant: "outlined",
        },
        {
          label: t("discardchanges"),
          icon: <Trash2 />,
          variant: "contained",
          action: confirmNavigation,
        },
      ]);

      setNextLocation(nextLocation);
      return false;
    }
    return true;
  };

  const confirmNavigation = () => {
    setConfirmedNavigation(true);
  };

  return {
    handleBlockedNavigation,
  };
};
