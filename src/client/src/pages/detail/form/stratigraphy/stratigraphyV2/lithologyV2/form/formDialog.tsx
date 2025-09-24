import { FC, ReactNode } from "react";
import { Dialog, Stack, Typography } from "@mui/material";
import { BoreholesButton } from "../../../../../../../components/buttons/buttons.tsx";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../../../../components/styledComponents.ts";

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
      <Stack direction="row">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Stack>
    </DialogHeaderContainer>
    <DialogMainContent sx={{ padding: "0 60px", display: "flex", justifyContent: "center" }}>
      {children}
    </DialogMainContent>
    <DialogFooterContainer>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.75}>
        <BoreholesButton
          variant="contained"
          color="primary"
          label={"close"}
          onClick={onClose}
          disabled={isCloseDisabled}
        />
      </Stack>
    </DialogFooterContainer>
  </Dialog>
);
