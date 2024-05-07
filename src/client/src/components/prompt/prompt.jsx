import { useContext } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { styled } from "@mui/system";
import { PromptContext } from "./promptContext";
import { theme } from "../../AppTheme";

export const PromptButton = styled(Button)({
  fontFamily: "Lato",
  fontSize: "16px",
  textTransform: "none",
  color: theme.palette.neutral.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.background.dark,
  },
});

export const Prompt = () => {
  const { promptIsOpen, title, message, actions, closePrompt } = useContext(PromptContext);
  return (
    <Dialog open={promptIsOpen} data-cy="prompt">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {actions?.map((action, index) => (
          <PromptButton
            key={index}
            onClick={() => {
              if (action.action != null) {
                action.action();
              }
              closePrompt();
            }}
            disabled={action.disabled === true}
            data-cy={"prompt-button-" + action.label}>
            {action.label}
          </PromptButton>
        ))}
      </DialogActions>
    </Dialog>
  );
};
