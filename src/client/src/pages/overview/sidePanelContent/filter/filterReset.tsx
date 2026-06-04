import { Button, Stack } from "@mui/material";
import { useCapitalizedTranslation } from "../../../../hooks/useCapitalizedTranslation.ts";

interface FilterResetProps {
  reset: () => void;
}

export const FilterReset = ({ reset }: FilterResetProps) => {
  const ct = useCapitalizedTranslation();
  return (
    <Stack direction="row" justifyContent="space-around" sx={{ marginTop: "24px" }}>
      <Button
        sx={{ width: "100%", marginLeft: 0, height: "48px" }}
        data-cy="reset-filter-button"
        variant="contained"
        onClick={() => {
          reset();
        }}>
        {ct("reset")}
      </Button>
    </Stack>
  );
};
