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

const CasingDisplay = props => {
  const {
    casing,
    selectedCasing,
    setSelectedCasing,
    isEditable,
    deleteCasing,
  } = props;
  const { t, i18n } = useTranslation();

  const formattedDateTime = dateString => {
    const date = new Date(dateString);
    const dateTimeFormat = new Intl.DateTimeFormat("de-CH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    return dateTimeFormat.format(date);
  };

  return (
    <Card
      key={casing.id}
      sx={{
        border: "1px solid lightgrey",
        borderRadius: "3px",
        p: 1.5,
        mb: 2,
        height: "100%",
      }}>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <StackFullWidth direction="column">
            <Typography variant="subtitle2">{t("name")}</Typography>
            <TypographyWithBottomMargin
              variant="subtitle1"
              data-cy="casing-name">
              {casing.name ? casing.name : "-"}
            </TypographyWithBottomMargin>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("fromdepth")}</Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-fromDepth">
                {casing.fromDepth || casing.fromDepth === 0
                  ? casing.fromDepth
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("todepth")}</Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-toDepth">
                {casing.toDepth || casing.toDepth === 0 ? casing.toDepth : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("kindFilling")}</Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-kind">
                {casing.kind?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("materialFilling")}
              </Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-material">
                {casing.material?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("dateSpudCasing")}</Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-dateStart">
                {casing.dateStart ? formattedDateTime(casing.dateStart) : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("dateFinishCasing")}
              </Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-dateFinish">
                {casing.dateFinish ? formattedDateTime(casing.dateFinish) : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("casing_inner_diameter")}
              </Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-innerDiameter">
                {casing.innerDiameter || casing.innerDiameter === 0
                  ? casing.innerDiameter
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("casing_outer_diameter")}
              </Typography>
              <TypographyWithBottomMargin
                variant="subtitle1"
                data-cy="casing-outerDiameter">
                {casing.outerDiameter || casing.outerDiameter === 0
                  ? casing.outerDiameter
                  : "-"}
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
            }}
            data-cy="casing-notes">
            {casing.notes || "-"}
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
                color: selectedCasing ? "disabled" : "black",
                cursor: "pointer",
              }}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedCasing && setSelectedCasing(casing);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedCasing ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
                cursor: "pointer",
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedCasing && deleteCasing(casing.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
    </Card>
  );
};

export default CasingDisplay;
