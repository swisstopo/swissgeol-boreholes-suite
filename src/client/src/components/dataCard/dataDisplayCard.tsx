import { ReactNode, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { DetailContext } from "../../pages/detail/detailContext.tsx";
import { DeleteButton, EditButton } from "../buttons/buttons.tsx";
import { FormContainer } from "../form/form";
import { PromptContext } from "../prompt/promptContext.tsx";
import { DataCardButtonContainer } from "./dataCard.tsx";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext.js";
import { DataCardEntity } from "./dataCards.tsx";

interface DataDisplayCardProps<T extends DataCardEntity> {
  item: T;
  deleteData: (id: number) => Promise<void>;
  children?: ReactNode;
}

export const DataDisplayCard = <T extends DataCardEntity>({ item, deleteData, children }: DataDisplayCardProps<T>) => {
  const { t } = useTranslation();
  const { selectedCard, selectCard, triggerReload } = useContext(DataCardContext);
  const { switchToCard } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);
  const { reloadBorehole, editingEnabled } = useContext(DetailContext);

  return (
    <>
      <FormContainer>{children}</FormContainer>
      {editingEnabled && (
        <DataCardButtonContainer>
          <DeleteButton
            onClick={() => {
              showPrompt(t("deleteMessage"), [
                {
                  label: t("cancel"),
                  action: undefined,
                },
                {
                  label: t("delete"),
                  icon: <Trash2 />,
                  variant: "contained",
                  action: () => {
                    if (item?.id) {
                      deleteData(item.id).then(() => {
                        triggerReload();
                        reloadBorehole();
                      });
                    }
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
