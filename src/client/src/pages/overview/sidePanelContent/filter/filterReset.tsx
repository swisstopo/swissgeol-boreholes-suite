import TranslationText from "../../../../components/legacyComponents/translationText";
import { Button, Stack } from "@mui/material";

interface FilterResetProps {
  reset: () => void;
}

export const FilterReset = ({ reset }: FilterResetProps) => {
  return (
    <Stack direction="row" justifyContent="space-around" sx={{ marginTop: "24px" }}>
      <Button
        sx={{ width: "100%", marginLeft: 0, height: "48px" }}
        data-cy="reset-filter-button"
        variant="contained"
        onClick={() => {
          reset();
        }}>
        <TranslationText firstUpperCase id="reset" />
      </Button>
    </Stack>
  );
};
