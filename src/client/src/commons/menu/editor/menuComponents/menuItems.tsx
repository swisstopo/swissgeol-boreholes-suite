import TranslationText from "../../../form/translationText";
import { Icon } from "semantic-ui-react";
import { MenuItemsProps } from "./menuComponentInterfaces";
import { Button, Stack } from "@mui/material";

export const MenuItems = ({ boreholes, refresh, reset }: MenuItemsProps) => {
  return (
    <Stack direction="row" justifyContent="space-around" sx={{ marginTop: 3, flex: "0 0 20px", bottom: "20px" }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          refresh();
        }}>
        <Icon loading={boreholes.isFetching} name="refresh" />
        <TranslationText firstUpperCase id="refresh" />
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          reset();
        }}>
        <Icon name="undo" />
        <TranslationText firstUpperCase id="reset" />
      </Button>
    </Stack>
  );
};
