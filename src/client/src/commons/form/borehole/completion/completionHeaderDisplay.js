import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Tooltip } from "@mui/material";
import { IconButtonWithMargin } from "./styledComponents";
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
  const { t } = useTranslation();
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
              <Tooltip title={t("edit")}>
                <IconButtonWithMargin
                  data-cy="edit-button"
                  onClick={e => {
                    e.stopPropagation();
                    setEditing(true);
                  }}>
                  <ModeEditIcon />
                </IconButtonWithMargin>
              </Tooltip>
              <Tooltip title={t("copy")}>
                <IconButtonWithMargin
                  data-cy="copy-button"
                  onClick={e => {
                    e.stopPropagation();
                    copyCompletion();
                  }}>
                  <CopyIcon />
                </IconButtonWithMargin>
              </Tooltip>
              <Tooltip title={t("delete")}>
                <IconButtonWithMargin
                  sx={{ color: "red !important", opacity: 0.9 }}
                  data-cy="delete-button"
                  onClick={e => {
                    e.stopPropagation();
                    deleteCompletion();
                  }}>
                  <DeleteIcon />
                </IconButtonWithMargin>
              </Tooltip>
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
