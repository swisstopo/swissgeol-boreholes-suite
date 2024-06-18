import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { DataCardButtonContainer } from "../dataCard/dataCard";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext";
import { PromptContext } from "../prompt/promptContext";
import { StackFullWidth } from "../baseComponents";
import { DeleteButton, EditButton } from "../buttons/buttons.tsx";

export const DataDisplayCard = props => {
  const { item, deleteData, isEditable } = props;
  const { t } = useTranslation();
  const { selectedCard, selectCard, triggerReload } = useContext(DataCardContext);
  const { switchToCard } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);

  return (
    <>
      <StackFullWidth spacing={1}>{props.children}</StackFullWidth>
      {isEditable && (
        <DataCardButtonContainer>
          <EditButton
            label="edit"
            onClick={() => {
              if (selectedCard) {
                switchToCard(item);
              } else {
                selectCard(item);
              }
            }}
          />
          <DeleteButton
            label="delete"
            onClick={() => {
              showPrompt(t("deleteTitle"), t("deleteMessage"), [
                {
                  label: t("cancel"),
                  action: null,
                },
                {
                  label: t("delete"),
                  action: () => {
                    deleteData(item.id).then(() => {
                      triggerReload();
                    });
                  },
                },
              ]);
            }}
          />
        </DataCardButtonContainer>
      )}
    </>
  );
};

export default DataDisplayCard;
