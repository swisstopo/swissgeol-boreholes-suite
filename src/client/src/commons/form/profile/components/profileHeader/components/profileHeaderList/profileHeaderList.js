import React from "react";
import * as Styled from "./styles";
import DateText from "../../../../../dateText";
import { Icon } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import TranslationText from "../../../../../translationText";

const ProfileHeaderList = props => {
  const {
    profiles,
    selectedStratigraphy,
    setSelectedStratigraphy,
    hasInstrumentWithoutCasing,
  } = props;
  const { t } = useTranslation();

  // Add a tab for profiles without casing
  let enhancedProfiles = profiles;
  if (hasInstrumentWithoutCasing && profiles) {
    const noCasingProfile = {
      id: 0,
      name: <TranslationText id="no_casing" />,
    };
    enhancedProfiles = [...profiles, noCasingProfile];
  }

  return (
    <Styled.Container data-cy="profile-header-list">
      {enhancedProfiles?.map(item => (
        <Styled.Item
          key={item.id}
          onClick={() => {
            setSelectedStratigraphy(item);
          }}
          style={{
            borderBottom:
              item.id === selectedStratigraphy?.id && "2px solid black",
          }}>
          <Styled.ItemName>
            {item.primary && <Icon name="check" />}
            {item.name === null || item.name === ""
              ? t("common:np")
              : item.name}
          </Styled.ItemName>
          <Styled.ItemDate>
            <DateText date={item.date} />
          </Styled.ItemDate>
        </Styled.Item>
      ))}
    </Styled.Container>
  );
};

export default ProfileHeaderList;
