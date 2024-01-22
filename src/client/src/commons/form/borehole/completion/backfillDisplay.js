import React from "react";
import { Card, Stack, Tooltip, Typography } from "@mui/material";
import {
  TypographyWithBottomMargin,
  StackFullWidth,
  StackHalfWidth,
} from "./styledComponents";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

const BackfillDisplay = props => {
  const {
    backfill,
    selectedBackfill,
    setSelectedBackfill,
    isEditable,
    deleteBackfill,
  } = props;
  const { t, i18n } = useTranslation();

  return (
    <Card
      key={backfill.id}
      sx={{
        border: "1px solid lightgrey",
        borderRadius: "3px",
        p: 1.5,
        mb: 2,
        height: "100%",
      }}>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("fromdepth")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {backfill.fromDepth || backfill.fromDepth === 0
                  ? backfill.fromDepth
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("todepth")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {backfill.toDepth || backfill.toDepth === 0
                  ? backfill.toDepth
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("kindFilling")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {backfill.kind?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("materialFilling")}
              </Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {backfill.material?.[i18n.language] || "-"}
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
            {backfill.notes || "-"}
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
                color: selectedBackfill ? "disabled" : "black",
                cursor: "pointer",
              }}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedBackfill && setSelectedBackfill(backfill);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedBackfill ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
                cursor: "pointer",
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedBackfill && deleteBackfill(backfill.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
    </Card>
  );
};

export default BackfillDisplay;
