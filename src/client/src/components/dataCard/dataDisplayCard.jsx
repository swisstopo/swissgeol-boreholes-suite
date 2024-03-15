import { useContext } from "react";
import { DataCardButtonContainer } from "../dataCard/dataCard";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext";
import { StackFullWidth } from "../baseComponents";
import { EditButton, DeleteButton } from "../buttons/buttons";

export const DataDisplayCard = props => {
  const { item, deleteData, isEditable } = props;
  const { selectedCard, selectCard, triggerReload } = useContext(DataCardContext);
  const { switchToCard } = useContext(DataCardSwitchContext);

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
              deleteData(item.id).then(() => {
                triggerReload();
              });
            }}
          />
        </DataCardButtonContainer>
      )}
    </>
  );
};

export default DataDisplayCard;
