import { useCallback, useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { ModeChange, modeLabelKey } from "./classificationMapping.ts";

/**
 * Guards whatever makes an open mode change final. The first field the user takes over after the
 * analysis switched the mode closes the way back to the values of the mode that was left, so the user
 * confirms losing them before it happens.
 * @param modeChange The mode change of the open analysis, if any.
 * @param isModeChangeFixed Whether the mode change is final already.
 * @returns A function that runs `onConfirm` straight away when there is nothing to lose, and otherwise
 * once the user confirms. `onCancel` runs when the user declines.
 */
export const useConfirmModeChange = (modeChange: ModeChange | undefined, isModeChangeFixed: boolean) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);

  return useCallback(
    (onConfirm: () => void, onCancel?: () => void) => {
      if (!modeChange || isModeChangeFixed) {
        onConfirm();
        return;
      }
      showPrompt(
        <Trans
          i18nKey="analysisModeChangeConfirm"
          values={{ previous: t(modeLabelKey(modeChange.previous)), next: t(modeLabelKey(modeChange.next)) }}
          components={{ strike: <s /> }}
        />,
        [
          { label: "cancel", action: onCancel },
          { label: "acceptChange", variant: "contained", action: onConfirm },
        ],
      );
    },
    [isModeChangeFixed, modeChange, showPrompt, t],
  );
};
