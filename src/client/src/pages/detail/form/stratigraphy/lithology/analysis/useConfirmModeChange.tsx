import { useCallback, useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { ModeChange, modeLabelKey } from "./classificationMapping.ts";

/** Whether the analysis switched the mode and nothing the user took over has made the switch final yet. */
export const isModeChangeOpen = (
  modeChange: ModeChange | undefined,
  isModeChangeFixed: boolean,
): modeChange is ModeChange => modeChange !== undefined && !isModeChangeFixed;

/** Asks before every analysed value is taken over at once, then runs `onConfirm`. */
export type ConfirmAcceptAll = (messageKey: string, onConfirm: () => void) => void;

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
      if (!isModeChangeOpen(modeChange, isModeChangeFixed)) {
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

/**
 * Guards taking over every analysed value at once. While the mode change is open that makes it final,
 * so the user is told what is lost with the mode that was left, as for a single field. Otherwise the
 * given message asks.
 * @param modeChange The mode change of the open analysis, if any.
 * @param isModeChangeFixed Whether the mode change is final already.
 */
export const useConfirmAcceptAll = (
  modeChange: ModeChange | undefined,
  isModeChangeFixed: boolean,
): ConfirmAcceptAll => {
  const { showPrompt } = useContext(PromptContext);
  const confirmModeChange = useConfirmModeChange(modeChange, isModeChangeFixed);

  return useCallback(
    (messageKey: string, onConfirm: () => void) => {
      if (isModeChangeOpen(modeChange, isModeChangeFixed)) {
        confirmModeChange(onConfirm);
        return;
      }
      showPrompt(messageKey, [
        { label: "cancel", action: () => {} },
        { label: "acceptValues", variant: "contained", action: onConfirm },
      ]);
    },
    [confirmModeChange, isModeChangeFixed, modeChange, showPrompt],
  );
};
