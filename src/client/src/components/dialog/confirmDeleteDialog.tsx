import { Box, Dialog, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import { theme } from "../../AppTheme";
import { styled } from "@mui/material/styles";
import { CancelButton, DeletePrimaryButton } from "../buttons/buttons.tsx";

interface DialogProps {
  onConfirmCallback?: () => void;
  deleteMessage: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  width?: number;
}

const ModalMainContent = styled(Box)({
  padding: theme.spacing(3),
  flexGrow: 1,
});

const ModalFooterContainer = styled(Box)({
  borderTop: "1px solid " + theme.palette.border,
  padding: theme.spacing(3),
});

export const ConfirmDeleteDialog = ({
  onConfirmCallback = () => {},
  open,
  setOpen,
  deleteMessage,
  width = 500,
}: DialogProps) => {
  const DialogWindowStyle = {
    width: width,
    borderRadius: 1,
  };

  return (
    <div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Stack sx={DialogWindowStyle}>
          <ModalMainContent>{<Typography>{deleteMessage}</Typography>}</ModalMainContent>
          <ModalFooterContainer>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
              <CancelButton onClick={() => setOpen(false)} />
              <DeletePrimaryButton
                label={"delete"}
                onClick={() => {
                  setOpen(false);
                  onConfirmCallback();
                }}
              />
            </Stack>
          </ModalFooterContainer>
        </Stack>
      </Dialog>
    </div>
  );
};
