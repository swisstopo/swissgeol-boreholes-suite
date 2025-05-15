import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { DateText } from "../../../../../../../components/dateText.js";
import * as Styled from "./styles.js";

const ProfileHeaderList = props => {
  const { profiles, selectedStratigraphy, setSelectedStratigraphy } = props;
  const { t } = useTranslation();

  return (
    <Styled.Container data-cy="profile-header-list">
      {profiles?.map((item, index) => (
        <Styled.Item
          data-cy={"profile-header-tab-" + index}
          key={item.id}
          onClick={() => {
            setSelectedStratigraphy(item);
          }}
          style={{
            borderBottom: item.id === selectedStratigraphy?.id && "2px solid black",
          }}>
          <Styled.ItemName>
            {item.primary && <Check />}
            {item.name === null || item.name === "" ? t("common:np") : item.name}
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
