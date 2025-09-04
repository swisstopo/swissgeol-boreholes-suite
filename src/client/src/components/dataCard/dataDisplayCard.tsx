import { ReactNode, useContext } from "react";
import { Trash2 } from "lucide-react";
import { useReloadBoreholes } from "../../api/borehole.ts";
import { useResetTabStatus } from "../../hooks/useResetTabStatus.ts";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { TabName } from "../../pages/detail/form/workflow/workflow.ts";
import { DeleteButton, EditButton } from "../buttons/buttons.tsx";
import { FormContainer } from "../form/form";
import { PromptContext } from "../prompt/promptContext.tsx";
import { DataCardButtonContainer } from "./dataCard.tsx";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext.js";
import { DataCardEntity } from "./dataCards.tsx";

interface DataDisplayCardProps<T extends DataCardEntity> {
  item: T;
  deleteData: (id: number) => Promise<void>;
  entityName: TabName;
  children?: ReactNode;
}

export const DataDisplayCard = <T extends DataCardEntity>({
  item,
  deleteData,
  entityName,
  children,
}: DataDisplayCardProps<T>) => {
  const { selectedCard, selectCard, triggerReload } = useContext(DataCardContext);
  const { switchToCard } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);
  const { editingEnabled } = useContext(EditStateContext);
  const reloadBoreholes = useReloadBoreholes();
  const resetTabStatus = useResetTabStatus([entityName]);

  return (
    <>
      <FormContainer>{children}</FormContainer>
      {editingEnabled && (
        <DataCardButtonContainer>
          <DeleteButton
            onClick={() => {
              showPrompt("deleteMessage", [
                {
                  label: "cancel",
                  action: undefined,
                },
                {
                  label: "delete",
                  icon: <Trash2 />,
                  variant: "contained",
                  action: () => {
                    if (item?.id) {
                      deleteData(item.id).then(() => {
                        resetTabStatus();
                        triggerReload();
                        reloadBoreholes();
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
