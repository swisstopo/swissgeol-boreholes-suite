import TranslationText from "../../../../pages/detail/form/translationText";
import { MenuItemsProps } from "./menuComponentInterfaces";
import { Button, Stack } from "@mui/material";

export const MenuItems = ({ reset }: MenuItemsProps) => {
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
