import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Backdrop, Box, CircularProgress, Stack } from "@mui/material";
import { CircleCheck, CircleX } from "lucide-react";
import { theme } from "../../AppTheme.ts";
import { DeleteButton, SaveButton } from "../../components/buttons/buttons.tsx";
import { SaveContext, SaveContextProps } from "./saveContext.tsx";

export const SaveBar = () => {
  const { t } = useTranslation();
  const { showSaveFeedback, hasChanges, isSaving, triggerSave, triggerReset } =
    useContext<SaveContextProps>(SaveContext);

  const changesMessage = (
    <>
      <CircleX />
      <Box data-cy="save-bar-text"> {t("unsavedChanges")}</Box>
    </>
  );

  const savedMessage = (
    <>
      <CircleCheck />
      <Box data-cy="save-bar-text"> {t("savedChanges")}</Box>
    </>
  );

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      data-cy="save-bar"
      p={1}
      sx={{
        boxShadow: theme.shadows[2],
        borderTop: "1px solid rgba(223, 228, 233, 1)",
        minHeight: "56px",
        width: "100%",
      }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ flexGrow: 1, color: hasChanges ? theme.palette.error.light : theme.palette.success.main }}>
        {hasChanges && changesMessage}
        {showSaveFeedback && !hasChanges && savedMessage}
      </Stack>
      <Stack spacing={1} direction="row">
        <DeleteButton disabled={!hasChanges || isSaving} label="discardchanges" onClick={triggerReset} />
        <SaveButton disabled={!hasChanges || isSaving} variant="contained" onClick={triggerSave} />
      </Stack>
      <Backdrop
        sx={{
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.background.backdrop,
          zIndex: theme.zIndex.modal,
        }}
        open={isSaving}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Stack>
  );
};
