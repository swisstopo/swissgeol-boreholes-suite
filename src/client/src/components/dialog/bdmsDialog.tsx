import { useState } from "react";
import type { ModalProps } from "@mui/material";
import { Box, Dialog, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Markdown from "markdown-to-jsx";
import { theme } from "../../AppTheme";
import { AcceptButton } from "../buttons/buttons";
import { styled } from "@mui/material/styles";

interface DialogProps {
  onCloseCallback?: () => void;
  closeOnBackdropClick?: boolean;
  title?: string | null;
  headerContent?: JSX.Element | null;
  mainContent?: string | null;
  markdownContent?: string | null;
  width?: number;
  height?: number;
}

const DialogHeaderContainer = styled(Box)({
  borderBottom: "1px solid " + theme.palette.border,
  paddingTop: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  paddingBottom: theme.spacing(2),
});

const ModalMainContent = styled(Box)({
  padding: theme.spacing(3),
  flexGrow: 1,
});

const ModalFooterContainer = styled(Box)({
  borderTop: "1px solid " + theme.palette.border,
  padding: theme.spacing(3),
});

export const BdmsDialog = ({
  title,
  headerContent = null,
  mainContent = null,
  markdownContent = null,
  width = 500,
  height = 400,
  onCloseCallback = () => {},
  closeOnBackdropClick = true,
}: DialogProps) => {
  const [open, setOpen] = useState(true);

  const closeDialog = () => {
    setOpen(false);
    onCloseCallback();
  };

  const handleClose: ModalProps["onClose"] = (event: MouseEvent, reason: string) => {
    if (!closeOnBackdropClick && reason === "backdropClick") return;
    closeDialog();
  };

  const DialogWindowStyle = {
    width: width,
    height: height,
    borderRadius: 1,
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <Stack sx={DialogWindowStyle}>
          <DialogHeaderContainer>
            <Stack direction="row">
              <Typography variant="h5" sx={{ flexGrow: 1 }}>
                {title}
              </Typography>
              {headerContent && headerContent}
            </Stack>
          </DialogHeaderContainer>
          <ModalMainContent>
            {mainContent && <Typography>{mainContent}</Typography>}
            {markdownContent && <Markdown>{markdownContent}</Markdown>}
          </ModalMainContent>
          <ModalFooterContainer>
            <Stack direction="row" justifyContent="flex-end" alignItems="center">
              <AcceptButton onClick={closeDialog} />
            </Stack>
          </ModalFooterContainer>
        </Stack>
      </Dialog>
    </div>
  );
};
