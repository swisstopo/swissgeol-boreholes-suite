import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { DataCardButtonContainer } from "./dataCard.jsx";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext";
import { PromptContext } from "../prompt/promptContext";
import { StackFullWidth } from "../baseComponents";
import { EditButton, DeleteButton } from "../buttons/buttons";

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
            onClick={() => {
              if (selectedCard) {
                switchToCard(item);
              } else {
                selectCard(item);
              }
            }}
          />
          <DeleteButton
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
