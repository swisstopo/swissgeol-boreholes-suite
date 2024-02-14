import React from "react";
import { DataCardButtonContainer } from "../dataCard/dataCard";
import { StackFullWidth } from "../baseComponents";
import { EditButton, DeleteButton } from "../buttons/buttons";

export const DataDisplayCard = props => {
  const { item, selected, setSelected, deleteData, isEditable } = props;

  return (
    <>
      <StackFullWidth spacing={1}>{props.children}</StackFullWidth>
      {isEditable && (
        <DataCardButtonContainer>
          <EditButton
            onClick={e => {
              e.stopPropagation();
              !selected && setSelected(item);
            }}
          />
          <DeleteButton
            onClick={e => {
              e.stopPropagation();
              !selected && deleteData(item.id);
            }}
          />
        </DataCardButtonContainer>
      )}
    </>
  );
};

export default DataDisplayCard;
