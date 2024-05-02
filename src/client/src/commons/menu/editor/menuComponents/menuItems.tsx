import TranslationText from "../../../form/translationText";
import { Icon, Menu } from "semantic-ui-react";
import { MenuItemsProps } from "./menuComponentInterfaces";

export const MenuItems = ({ boreholes, refresh, reset, user, setState }: MenuItemsProps) => {
  return (
    <>
      <Menu
        icon="labeled"
        key="sb-em-3"
        size="mini"
        style={{
          borderTop: "thin solid rgb(187, 187, 187)",
          margin: "0px",
        }}>
        <Menu.Item
          onClick={() => {
            refresh();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon loading={boreholes.isFetching} name="refresh" size="tiny" />
          <TranslationText firstUpperCase id="refresh" />
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            reset();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="undo" size="tiny" />
          <TranslationText firstUpperCase id="reset" />
        </Menu.Item>
      </Menu>
      <Menu
        icon="labeled"
        key="sb-em-4"
        size="mini"
        style={{
          margin: "0px",
        }}>
        <Menu.Item
          disabled={user.data.roles.indexOf("EDIT") === -1}
          data-cy="import-borehole-button"
          onClick={() => {
            setState({
              modal: true,
              upload: true,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="upload" size="tiny" />
          <TranslationText firstUpperCase id="import" />
        </Menu.Item>
        <Menu.Item
          disabled={user.data.roles.indexOf("EDIT") === -1}
          data-cy="new-borehole-button"
          onClick={() => {
            setState({
              modal: true,
              upload: false,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="add" size="tiny" />
          <TranslationText firstUpperCase extra={{ what: "borehole" }} id="new" />
        </Menu.Item>
      </Menu>
    </>
  );
};
