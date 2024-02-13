import React, { useState } from "react";
import { Stack } from "@mui/material";
import {
  BdmsIconButton,
  IconButtonWithMargin,
} from "../../../../components/buttons/buttons";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

const CompletionHeaderDisplay = props => {
  const {
    completion,
    isEditable,
    setEditing,
    copyCompletion,
    deleteCompletion,
  } = props;
  const [expanded, setExpanded] = useState(false);
  const toggleHeader = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Stack
        data-cy="completion-header-display"
        direction="column"
        aria-expanded={expanded}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap">
          <FormDisplay
            label="name"
            value={completion?.name}
            sx={{ flex: "1 1 180px" }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flex={"0 0 400px"}>
            <FormDisplay
              label="completionKind"
              value={completion?.kind}
              type={FormDisplayType.Domain}
            />
            <FormDisplay
              label="mainCompletion"
              value={completion?.isPrimary}
              type={FormDisplayType.Boolean}
            />
          </Stack>
        </Stack>
        {expanded && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              flexWrap="wrap">
              <FormDisplay
                label="notes"
                value={completion?.notes}
                sx={{ flex: "1 1 180px" }}
              />
              <FormDisplay
                label="dateAbandonmentCompletion"
                value={completion?.abandonDate}
                type={FormDisplayType.Date}
                sx={{ flex: "0 0 400px" }}
              />
            </Stack>
            <Stack
              direction="row"
              sx={{
                marginLeft: "auto",
                visibility: isEditable ? "visible" : "hidden",
              }}>
              <BdmsIconButton
                icon={<ModeEditIcon />}
                tooltipLabel={"edit"}
                onClick={e => {
                  e.stopPropagation();
                  setEditing(true);
                }}
              />
              <BdmsIconButton
                icon={<CopyIcon />}
                tooltipLabel={"copy"}
                onClick={e => {
                  e.stopPropagation();
                  copyCompletion();
                }}
              />
              <BdmsIconButton
                icon={<DeleteIcon />}
                tooltipLabel={"delete"}
                color="error"
                onClick={e => {
                  e.stopPropagation();
                  deleteCompletion();
                }}
              />
            </Stack>
          </>
        )}
        <IconButtonWithMargin
          onClick={toggleHeader}
          sx={{ paddingBottom: "0" }}
          data-cy="completion-toggle-header">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButtonWithMargin>
      </Stack>
    </>
  );
};
export default CompletionHeaderDisplay;
