import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertColor, Box, Button, CircularProgress } from "@mui/material";
import { X } from "lucide-react";
import { theme } from "../../../AppTheme.ts";
import { LabelingAlert } from "./labelingPanel.tsx";
import { labelingButtonStyles } from "./labelingStyles.ts";

interface FloatingExtractionFeedbackProps {
  isExtractionLoading: boolean;
  cancelRequest: () => void;
  alertIsOpen: boolean;
  closeAlert: () => void;
  severity?: AlertColor;
  text?: string | ReactNode;
}

export const FloatingExtractionFeedback: FC<FloatingExtractionFeedbackProps> = ({
  isExtractionLoading,
  cancelRequest,
  alertIsOpen,
  severity,
  text,
  closeAlert,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        position: "absolute",
        top: theme.spacing(2),
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "500",
        maxWidth: "70%",
        overflow: "hidden",
        boxShadow: theme.shadows[1],
      }}>
      {(isExtractionLoading || alertIsOpen) && (
        <Box
          sx={{
            width: "auto",
            maxWidth: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {alertIsOpen ? (
            <LabelingAlert
              data-cy="labeling-alert"
              variant="filled"
              severity={severity}
              onClose={closeAlert}
              icon={severity !== "info"}>
              {text}
            </LabelingAlert>
          ) : (
            isExtractionLoading && (
              <Button onClick={() => cancelRequest()} variant="text" endIcon={<X />} sx={labelingButtonStyles}>
                <CircularProgress sx={{ marginRight: "15px", width: "15px !important", height: "15px !important" }} />
                {t("analyze")}
              </Button>
            )
          )}
        </Box>
      )}
    </Box>
  );
};
