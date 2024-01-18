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

const InstrumentationDisplay = props => {
  const {
    instrumentation,
    selectedInstrumentation,
    setSelectedInstrumentation,
    isEditable,
    deleteInstrumentation,
  } = props;
  const { t, i18n } = useTranslation();

  return (
    <Card
      key={instrumentation.id}
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
                {instrumentation.fromDepth || instrumentation.fromDepth === 0
                  ? instrumentation.fromDepth
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("todepth")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {instrumentation.toDepth || instrumentation.toDepth === 0
                  ? instrumentation.toDepth
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("name")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {instrumentation.name ? instrumentation.name : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("casingId")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {instrumentation.casingId ? instrumentation.casing.name : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("kindInstrument")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {instrumentation.kind?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("statusInstrument")}
              </Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {instrumentation.status?.[i18n.language] || "-"}
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
            {instrumentation.notes || "-"}
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
              color={selectedInstrumentation ? "disabled" : "black"}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedInstrumentation &&
                  setSelectedInstrumentation(instrumentation);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedInstrumentation ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedInstrumentation &&
                  deleteInstrumentation(instrumentation.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
    </Card>
  );
};

export default InstrumentationDisplay;
