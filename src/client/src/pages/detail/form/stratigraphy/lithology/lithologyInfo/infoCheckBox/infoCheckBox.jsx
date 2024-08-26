import * as Styled from "./styles.js";
import { Checkbox, Popup } from "semantic-ui-react";
import { copyStratigraphy, deleteStratigraphy } from "../../../../../../../api/fetchApiV2.js";
import { useTranslation } from "react-i18next";
import { CopyButton, DeleteButton } from "../../../../../../../components/buttons/buttons";

const InfoCheckBox = props => {
  const { profileInfo, updateChange, isEditable, onUpdated } = props.data;
  const { t } = useTranslation();

  return (
    <Styled.CheckBoxContainer>
      <Styled.FormContainer size="small">
        <Checkbox
          checked={profileInfo && profileInfo?.isPrimary}
          label=""
          onChange={(ev, data) => {
            if (data.checked === true) {
              updateChange("isPrimary", data.checked, false);
            }
          }}
          toggle
        />
        {t("mainStratigraphy")}
      </Styled.FormContainer>
      {isEditable && (
        <div style={{ display: "flex" }} data-cy="clone-and-delete-buttons">
          <CopyButton
            onClick={() => {
              copyStratigraphy(profileInfo?.id).then(() => {
                onUpdated("cloneStratigraphy");
              });
            }}></CopyButton>
          <Popup flowing hoverable on="click" position="right center" trigger={<DeleteButton label="delete" />}>
            {t("deleteForever")}?
            <br />
            <DeleteButton
              label="delete"
              onClick={() => {
                deleteStratigraphy(profileInfo?.id).then(() => {
                  onUpdated("deleteStratigraphy");
                });
              }}
            />
          </Popup>
        </div>
      )}
    </Styled.CheckBoxContainer>
  );
};

export default InfoCheckBox;
