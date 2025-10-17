import { FC, ReactNode } from "react";
import { Dialog, Typography } from "@mui/material";
import { BoreholesButton } from "../buttons/buttons.tsx";
import { DialogFooterContainer, DialogHeaderContainer, DialogMainContent } from "../styledComponents.ts";

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  isCloseDisabled?: boolean;
  children: ReactNode;
}

export const FormDialog: FC<FormDialogProps> = ({ open, title, onClose, isCloseDisabled = false, children }) => (
  <Dialog open={open} fullScreen>
    <DialogHeaderContainer>
      <Typography variant="h4" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
    </DialogHeaderContainer>
    <DialogMainContent sx={{ padding: "0 60px", display: "flex", justifyContent: "center" }}>
      {children}
    </DialogMainContent>
    <DialogFooterContainer>
      <BoreholesButton
        variant="contained"
        color="primary"
        label={"close"}
        onClick={onClose}
        disabled={isCloseDisabled}
      />
    </DialogFooterContainer>
  </Dialog>
);
