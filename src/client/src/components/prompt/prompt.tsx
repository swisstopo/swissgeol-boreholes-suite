import { useContext } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import { PromptContext } from "./promptContext.js";
import { BdmsButton } from "../buttons/buttons.tsx";

export const Prompt = () => {
  const { promptIsOpen, message, actions, closePrompt } = useContext(PromptContext);
  return (
    <Dialog open={promptIsOpen} data-cy="prompt">
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
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
      </DialogActions>
    </Dialog>
  );
};
