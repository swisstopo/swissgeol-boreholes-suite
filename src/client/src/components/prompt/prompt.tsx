import { useContext } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, Stack } from "@mui/material";
import { PromptContext } from "./promptContext.js";
import { BdmsButton } from "../buttons/buttons.tsx";

export const Prompt = () => {
  const { promptIsOpen, message, actions, dialogContent, dialogWidth, closePrompt } = useContext(PromptContext);
  return (
    <Dialog
      open={promptIsOpen}
      data-cy="prompt"
      sx={{
        margin: "auto",
        width: dialogWidth ?? "326px",
        position: "absolute",
        "& .MuiDialog-paper": {
          p: 3,
        },
      }}>
      <DialogContent sx={{ p: 0 }}>
        <DialogContentText>{message}</DialogContentText>
        {dialogContent && <div style={{ marginBottom: "16px" }}>{dialogContent}</div>}
      </DialogContent>
      <DialogActions sx={{ pr: 0, pb: 0, pt: 2 }}>
        <Stack direction="row" spacing={2}>
          {actions?.map((action, index) => (
            <BdmsButton
              label={action.label}
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
};
