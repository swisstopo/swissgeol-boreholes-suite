import { isValidElement, ReactNode, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogActions, DialogContent, DialogContentText, Stack } from "@mui/material";
import { BoreholesButton } from "../buttons/buttons.tsx";
import { PromptContext } from "./promptContext.js";
import { PromptMessage } from "./promptInterface.ts";

export const Prompt = () => {
  const { t } = useTranslation();
  const { promptIsOpen, message, actions, dialogContent, closePrompt } = useContext(PromptContext);

  const renderMessage = (promptMessage: PromptMessage): ReactNode => {
    if (typeof promptMessage === "string") return t(promptMessage);
    if (isValidElement(promptMessage)) return promptMessage;
    return t(promptMessage.key, promptMessage.values);
  };

  if (message) {
    return (
      <Dialog
        open={promptIsOpen}
        data-cy="prompt"
        sx={{
          margin: "auto",
          width: "460px",
          position: "absolute",
          "& .MuiDialog-paper": {
            p: 3,
          },
        }}>
        <DialogContent sx={{ p: 0 }}>
          <DialogContentText sx={{ p: 0 }}>{renderMessage(message)}</DialogContentText>
          {dialogContent && <div style={{ marginBottom: "16px" }}>{dialogContent}</div>}
        </DialogContent>
        <DialogActions sx={{ pr: 0, pb: 0, pt: 2, border: "none" }}>
          <Stack direction="row" spacing={2}>
            {actions?.map((action, index) => (
              <BoreholesButton
                label={action.label}
                labelValues={action.labelValues}
                key={index}
                onClick={() => {
                  if (action.action != null) {
                    action.action();
                  }
                  closePrompt();
                }}
                variant={action.variant ? action.variant : "outlined"}
                disabled={action.disabled}
                icon={action.icon}
              />
            ))}
          </Stack>
        </DialogActions>
      </Dialog>
    );
  }
};
