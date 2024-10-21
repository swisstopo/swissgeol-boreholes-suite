import { Box, Stack } from "@mui/material";
import { CircleCheck, CircleX } from "lucide-react";
import { theme } from "../../AppTheme.ts";
import { DeleteButton, SaveButton } from "../../components/buttons/buttons.tsx";

interface SaveBarProps {
  triggerSubmit: () => void;
  triggerReset: () => void;
  isFormDirty: boolean;
}
export const SaveBar = ({ triggerSubmit, triggerReset, isFormDirty }: SaveBarProps) => {
  const noChangesMessage = (
    <>
      <CircleCheck />
      <Box> Alles gespeichert</Box>
    </>
  );

  const changesMessage = (
    <>
      <CircleX />
      <Box> Ungespeicherte Änderungen</Box>
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
        {isFormDirty ? changesMessage : noChangesMessage}
      </Stack>

      <Stack spacing={1} direction="row">
        <DeleteButton
          disabled={!isFormDirty}
          label="discardChanges"
          onClick={() => {
            triggerReset();
          }}
        />
        <SaveButton
          disabled={!isFormDirty}
          variant="contained"
          onClick={() => {
            triggerSubmit();
          }}
        />
      </Stack>
    </Stack>
  );
};
