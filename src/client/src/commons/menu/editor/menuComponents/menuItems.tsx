import TranslationText from "../../../form/translationText";
import { MenuItemsProps } from "./menuComponentInterfaces";
import { Button, Stack } from "@mui/material";

export const MenuItems = ({ reset }: MenuItemsProps) => {
  return (
    <Stack direction="row" justifyContent="space-around" sx={{ marginTop: 3 }}>
      <Button
        sx={{ width: "100%", marginLeft: 0, height: "48px" }}
        variant="contained"
        onClick={() => {
          reset();
        }}>
        <TranslationText firstUpperCase id="reset" />
      </Button>
    </Stack>
  );
};
