import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { Checkbox } from "semantic-ui-react";
import { Trash2 } from "lucide-react";
import { copyStratigraphy, deleteStratigraphy } from "../../../../../../../api/fetchApiV2.js";
import { CopyButton, DeleteButton } from "../../../../../../../components/buttons/buttons";
import { PromptContext } from "../../../../../../../components/prompt/promptContext";
import * as Styled from "./styles.js";

const InfoCheckBox = props => {
  const { profileInfo, updateChange, isEditable, onUpdated } = props.data;
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);

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
        <Stack direction="row" data-cy="clone-and-delete-buttons" gap={2} mr={1}>
          <CopyButton
            onClick={() => {
              copyStratigraphy(profileInfo?.id).then(() => {
                onUpdated("cloneStratigraphy");
              });
            }}></CopyButton>
          <DeleteButton
            onClick={() => {
              showPrompt(t("deleteMessage"), [
                {
                  label: t("cancel"),
                  action: null,
                },
                {
                  label: t("delete"),
                  icon: <Trash2 />,
                  variant: "contained",
                  action: () => {
                    deleteStratigraphy(profileInfo?.id).then(() => {
                      onUpdated("deleteStratigraphy");
                    });
                  },
                },
              ]);
            }}
          />
        </Stack>
      )}
    </Styled.CheckBoxContainer>
  );
};

export default InfoCheckBox;
