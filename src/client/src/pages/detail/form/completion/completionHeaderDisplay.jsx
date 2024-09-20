import { useState } from "react";
import { IconButton, Stack } from "@mui/material";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { CopyButton, DeleteButton, EditButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";

const CompletionHeaderDisplay = props => {
  const { completion, isEditable, setEditing, copyCompletion, deleteCompletion } = props;
  const [expanded, setExpanded] = useState(false);
  const toggleHeader = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Stack data-cy="completion-header-display" direction="column" aria-expanded={expanded}>
        <FormContainer direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <FormDisplay label="name" value={completion?.name} sx={{ flex: "1 1 180px" }} />
          <FormContainer direction="row" justifyContent="space-between" alignItems="center" flex={"0 0 400px"}>
            <FormDisplay label="completionKind" value={completion?.kind} type={FormValueType.Domain} />
            <FormDisplay label="mainCompletion" value={completion?.isPrimary} type={FormValueType.Boolean} />
          </FormContainer>
        </FormContainer>
        {expanded && (
          <>
            <FormContainer direction="row" justifyContent="space-between" flexWrap="wrap">
              <FormDisplay label="notes" value={completion?.notes} sx={{ flex: "1 1 180px" }} />
              <FormDisplay
                label="dateAbandonmentCompletion"
                value={completion?.abandonDate}
                type={FormValueType.Date}
                sx={{ flex: "0 0 400px" }}
              />
            </FormContainer>
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
        <IconButton
          onClick={toggleHeader}
          sx={{ paddingBottom: "0", "&:hover": { backgroundColor: "transparent" } }}
          data-cy="completion-toggle-header">
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </IconButton>
      </Stack>
    </>
  );
};
export default CompletionHeaderDisplay;
