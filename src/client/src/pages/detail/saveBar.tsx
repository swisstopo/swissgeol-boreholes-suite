import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { CircleCheck, CircleX } from "lucide-react";
import { theme } from "../../AppTheme.ts";
import { DeleteButton, SaveButton } from "../../components/buttons/buttons.tsx";
import { useFormDirtyStore } from "./formDirtyStore.ts";

interface SaveBarProps {
  triggerSubmit: () => void;
  triggerReset: () => void;
}
export const SaveBar = ({ triggerSubmit, triggerReset }: SaveBarProps) => {
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const isFormDirty = useFormDirtyStore(state => state.isFormDirty);

  useEffect(() => {
    setShowSaveFeedback(false);
  }, [location.pathname]);

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
        sx={{ flexGrow: 1, color: isFormDirty ? theme.palette.error.light : theme.palette.success.main }}>
        {isFormDirty && changesMessage}
        {showSaveFeedback && !isFormDirty && savedMessage}
      </Stack>

      <Stack spacing={1} direction="row">
        <DeleteButton
          disabled={!isFormDirty}
          label="discardchanges"
          onClick={() => {
            triggerReset();
          }}
        />
        <SaveButton
          disabled={!isFormDirty}
          variant="contained"
          onClick={() => {
            setShowSaveFeedback(true);
            triggerSubmit();
            setTimeout(() => setShowSaveFeedback(false), 4000);
          }}
        />
      </Stack>
    </Stack>
  );
};
