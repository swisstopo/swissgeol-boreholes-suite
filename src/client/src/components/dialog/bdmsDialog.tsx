import { useEffect, useState } from "react";
import { Box, Dialog, ModalProps, Stack } from "@mui/material";
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

const MarkdownWrapper = ({ markdownContent }: { markdownContent: string }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const handleRender = () => {
      setIsRendered(true);
    };

    const timer = setTimeout(handleRender, 0); // Run after current rendering cycle
    return () => clearTimeout(timer);
  }, [markdownContent]);

  return (
    <div>
      <div style={{ display: isRendered ? "block" : "none" }}>
        <Markdown>{markdownContent}</Markdown>
      </div>
    </div>
  );
};

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
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const handleRender = () => {
      setIsRendered(true);
    };

    const timer = setTimeout(handleRender, 0);
    return () => clearTimeout(timer); // First rendering cycle completes once the markdown is rendered. Then "isRendered" will be set to true and then dialog is displayed. Avoids flickering of the markdown content.
  }, [markdownContent]);

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
    isRendered && (
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
            {markdownContent && <MarkdownWrapper markdownContent={markdownContent} />}
          </ModalMainContent>
          <ModalFooterContainer>
            <Stack direction="row" justifyContent="flex-end" alignItems="center">
              <AcceptButton onClick={closeDialog} />
            </Stack>
          </ModalFooterContainer>
        </Stack>
      </Dialog>
    )
  );
};
