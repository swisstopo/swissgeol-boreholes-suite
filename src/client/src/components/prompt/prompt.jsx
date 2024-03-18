import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { styled } from "@mui/system";

export const PromptButton = styled(Button)({
  fontFamily: "Lato",
  fontSize: "16px",
  textTransform: "none",
  color: "rgba(0, 0, 0, 0.8)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

const Prompt = props => {
  const { open, setOpen, title, message, actions } = props;
  return (
    <Dialog open={open} data-cy="prompt">
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
              setOpen(false);
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

export default Prompt;
