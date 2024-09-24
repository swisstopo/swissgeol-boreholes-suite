import { List } from "semantic-ui-react";

import * as Styled from "./styles";

const ListItem = props => {
  const { path, name, location, history, icon, t, hasTranslation } = props;
  return (
    <Styled.Container>
      <List divided relaxed selection>
        <List.Item
          active={location.pathname === path}
          onClick={() => {
            history.push(path);
          }}
          style={{
            padding: "1em",
            borderRadius: "inherit",
            borderLeft:
              location.pathname.indexOf(path) >= 0 && name !== "done" ? "0.25em solid rgb(237, 29, 36)" : null,
          }}>
          <List.Icon name={icon} size="large" verticalAlign="middle" />
          <List.Content>
            {hasTranslation ? (
              <List.Header as="h3">{t(`common:${name}`)}</List.Header>
            ) : (
              <List.Header as="h3">{name}</List.Header>
            )}
          </List.Content>
        </List.Item>
        <Styled.Hr />
      </List>
    </Styled.Container>
  );
};

export default ListItem;
