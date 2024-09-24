import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { DeleteButton, EditButton } from "../buttons/buttons.tsx";
import { FormContainer } from "../form/form";
import { PromptContext } from "../prompt/promptContext.tsx";
import { DataCardButtonContainer } from "./dataCard.jsx";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext";

export const DataDisplayCard = props => {
  const { item, deleteData, isEditable } = props;
  const { t } = useTranslation();
  const { selectedCard, selectCard, triggerReload } = useContext(DataCardContext);
  const { switchToCard } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);

  return (
    <>
      <FormContainer>{props.children}</FormContainer>
      {isEditable && (
        <DataCardButtonContainer>
          <DeleteButton
            label="delete"
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
                    deleteData(item.id).then(() => {
                      triggerReload();
                    });
                  },
                },
              ]);
            }}
          />
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
        </DataCardButtonContainer>
      )}
    </>
  );
};

export default DataDisplayCard;
