import React from "react";
import { Stack, Tooltip, Typography } from "@mui/material";
import {
  TypographyWithBottomMargin,
  StackFullWidth,
  StackHalfWidth,
} from "./styledComponents";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

const BackfillDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t, i18n } = useTranslation();

  return (
    <StackFullWidth direction="row" justifyContent="space-between">
      <StackFullWidth direction="column" justifyContent="space-between">
        <StackFullWidth direction="row" spacing={1}>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("fromdepth")}</Typography>
            <TypographyWithBottomMargin variant="subtitle1">
              {item.fromDepth || item.fromDepth === 0 ? item.fromDepth : "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("todepth")}</Typography>
            <TypographyWithBottomMargin variant="subtitle1">
              {item.toDepth || item.toDepth === 0 ? item.toDepth : "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("kindFilling")}</Typography>
            <TypographyWithBottomMargin variant="subtitle1">
              {item.kind?.[i18n.language] || "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("materialFilling")}</Typography>
            <TypographyWithBottomMargin variant="subtitle1">
              {item.material?.[i18n.language] || "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
        </StackFullWidth>
        <Typography variant="subtitle2">{t("notes")}</Typography>
        <TypographyWithBottomMargin
          variant="subtitle1"
          sx={{
            display: "-webkit-box",
            overflow: "auto",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}>
          {item.notes || "-"}
        </TypographyWithBottomMargin>
      </StackFullWidth>
      <Stack
        direction="row"
        sx={{
          marginLeft: "auto",
          visibility: isEditable ? "visible" : "hidden",
        }}>
        <Tooltip title={t("edit")}>
          <ModeEditIcon
            sx={{
              color: selected ? "disabled" : "black",
              cursor: "pointer",
            }}
            data-cy="edit-icon"
            onClick={e => {
              e.stopPropagation();
              !selected && setSelected(item);
            }}
          />
        </Tooltip>
        <Tooltip title={t("delete")}>
          <DeleteIcon
            data-cy="delete-icon"
            sx={{
              color: selected ? "rgba(0, 0, 0, 0.26)" : "red",
              opacity: 0.7,
              cursor: "pointer",
            }}
            onClick={e => {
              e.stopPropagation();
              !selected && deleteData(item.id);
            }}
          />
        </Tooltip>
      </Stack>
    </StackFullWidth>
  );
};

export default BackfillDisplay;
