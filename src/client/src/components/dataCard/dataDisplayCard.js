import React from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataCardButtonContainer } from "../dataCard/dataCard";
import { BdmsIconButton } from "../buttons/buttons";
import { StackFullWidth } from "../baseComponents";

export const DataDisplayCard = props => {
  const { item, selected, setSelected, deleteData, isEditable } = props;

  return (
    <>
      <StackFullWidth spacing={1}>{props.children}</StackFullWidth>
      {isEditable && (
        <DataCardButtonContainer>
          <BdmsIconButton
            icon={<ModeEditIcon />}
            tooltipLabel={"edit"}
            onClick={e => {
              e.stopPropagation();
              !selected && setSelected(item);
            }}
          />
          <BdmsIconButton
            icon={<DeleteIcon />}
            tooltipLabel={"delete"}
            color="error"
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
