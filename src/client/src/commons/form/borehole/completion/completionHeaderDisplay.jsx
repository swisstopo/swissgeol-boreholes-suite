import { useState } from "react";
import { IconButton, Stack } from "@mui/material";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import { CopyButton, DeleteButton, EditButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const CompletionHeaderDisplay = props => {
  const { completion, isEditable, setEditing, copyCompletion, deleteCompletion } = props;
  const [expanded, setExpanded] = useState(false);
  const toggleHeader = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Stack data-cy="completion-header-display" direction="column" aria-expanded={expanded}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <FormDisplay label="name" value={completion?.name} sx={{ flex: "1 1 180px" }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" flex={"0 0 400px"}>
            <FormDisplay label="completionKind" value={completion?.kind} type={FormDisplayType.Domain} />
            <FormDisplay label="mainCompletion" value={completion?.isPrimary} type={FormDisplayType.Boolean} />
          </Stack>
        </Stack>
        {expanded && (
          <>
            <Stack direction="row" justifyContent="space-between" flexWrap="wrap">
              <FormDisplay label="notes" value={completion?.notes} sx={{ flex: "1 1 180px" }} />
              <FormDisplay
                label="dateAbandonmentCompletion"
                value={completion?.abandonDate}
                type={FormDisplayType.Date}
                sx={{ flex: "0 0 400px" }}
              />
            </Stack>
            {isEditable && (
              <DataCardButtonContainer>
                <CopyButton
                  onClick={e => {
                    e.stopPropagation();
                    copyCompletion();
                  }}
                />
                <DeleteButton
                  label="delete"
                  onClick={e => {
                    e.stopPropagation();
                    deleteCompletion();
                  }}
                />
                <EditButton
                  label="edit"
                  onClick={e => {
                    e.stopPropagation();
                    setEditing(true);
                  }}
                />
              </DataCardButtonContainer>
            )}
          </>
        )}
        <IconButton onClick={toggleHeader} sx={{ paddingBottom: "0" }} data-cy="completion-toggle-header">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>
    </>
  );
};
export default CompletionHeaderDisplay;
