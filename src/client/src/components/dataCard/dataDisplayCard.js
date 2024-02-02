import React from "react";
import { Stack } from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataCardButtonContainer } from "../dataCard/dataCard";
import { BdmsIconButton, ButtonColor } from "../buttons/buttons";

export const DataDisplayCard = props => {
  const { item, selected, setSelected, deleteData, isEditable } = props;

  return (
    <>
      <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
        {props.children}
      </Stack>
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
            color={ButtonColor.error}
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
