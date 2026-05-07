import { FC, ReactNode } from "react";
import { Dialog, ButtonProps as MuiButtonProps, Stack, Typography } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import { BoreholesButton } from "../buttons/buttons.tsx";
import { DialogFooterContainer, DialogHeaderContainer, DialogMainContent } from "../styledComponents.ts";

interface FormDialogAction {
  label: string;
  onClick?: () => Promise<boolean> | boolean;
  disabled?: boolean;
  variant?: MuiButtonProps["variant"];
  color?: MuiButtonProps["color"];
}

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  isCloseDisabled?: boolean;
  actions?: FormDialogAction[];
  headerAction?: ReactNode;
  children: ReactNode;
}

export const FormDialog: FC<FormDialogProps> = ({
  open,
  title,
  onClose,
  isCloseDisabled = false,
  actions,
  headerAction,
  children,
}) => (
  <Dialog open={open} maxWidth={false}>
    <DialogHeaderContainer>
      <Typography variant="h4" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      {headerAction}
    </DialogHeaderContainer>
    <DialogMainContent
      sx={{ px: 7.5, py: 3, width: "1160px", maxWidth: "100%", backgroundColor: theme.palette.background.lightgrey }}>
      <Stack gap={3}>{children}</Stack>
    </DialogMainContent>
    <DialogFooterContainer>
      {actions ? (
        actions.map(action => (
          <BoreholesButton
            key={action.label}
            variant={action.variant ?? "contained"}
            color={action.color ?? "primary"}
            label={action.label}
            disabled={action.disabled}
            onClick={async () => {
              if (action.onClick) {
                const success = await action.onClick();
                if (success) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
          />
        ))
      ) : (
        <BoreholesButton
          variant="contained"
          color="primary"
          label={"close"}
          onClick={onClose}
          disabled={isCloseDisabled}
        />
      )}
    </DialogFooterContainer>
  </Dialog>
);
