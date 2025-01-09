import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import {
  DialogFooterContainer,
  DialogHeaderContainer,
  DialogMainContent,
} from "../../../../components/styledComponents.ts";
import { ErrorResponse } from "../commons/actionsInterfaces.ts";

interface ImportErrorDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  errorResponse: ErrorResponse | null;
}

export const ImportErrorDialog = ({ open, setOpen, errorResponse }: ImportErrorDialogProps) => {
  const { t } = useTranslation();

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={closeDialog}>
      <Stack sx={{ width: 500, borderRadius: 1 }}>
        <DialogHeaderContainer>
          <Stack direction="row">
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              {t("validationErrorHeader")}
            </Typography>
          </Stack>
        </DialogHeaderContainer>
        <DialogMainContent data-cy="borehole-import-dialog">
          {errorResponse && (
            <Box>
              {/* In case of API response type ProblemDetails */}
              {errorResponse?.detail
                ?.split("\n")
                .filter((subString: string) => subString.includes("was not found"))
                .map((item: string, i: number) => <li key={item + i}>{item}</li>)}
              {/* In case of API response type ValidationProblemDetails */}
              {errorResponse.errors &&
                Object.entries(errorResponse.errors)
                  // Only display error messages for keys that are not empty
                  .filter(([key]) => key !== "")
                  .map(([key, value], index) => (
                    <Box key={key + index + 1}>
                      <Typography variant={"h6"}>{key}</Typography>
                      {value.map((item: string, i: string) => (
                        <li key={item + i}>{item}</li>
                      ))}
                    </Box>
                  ))}
            </Box>
          )}
        </DialogMainContent>
        <DialogFooterContainer>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <Button variant={"contained"} onClick={closeDialog}>
              Close
            </Button>
          </Stack>
        </DialogFooterContainer>
      </Stack>
    </Dialog>
  );
};
