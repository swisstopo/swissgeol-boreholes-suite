import { useTranslation } from "react-i18next";
import { Button, Stack } from "@mui/material";
import { capitalizeFirstLetter } from "../../../../utils.ts";

interface FilterResetProps {
  reset: () => void;
}

export const FilterReset = ({ reset }: FilterResetProps) => {
  const { t } = useTranslation();
  return (
    <Stack direction="row" justifyContent="space-around" sx={{ marginTop: "24px" }}>
      <Button
        sx={{ width: "100%", marginLeft: 0, height: "48px" }}
        data-cy="reset-filter-button"
        variant="contained"
        onClick={() => {
          reset();
        }}>
        {capitalizeFirstLetter(t("reset"))}
      </Button>
    </Stack>
  );
};
