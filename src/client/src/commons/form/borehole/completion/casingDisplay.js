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

const CasingDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
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
    <StackFullWidth direction="row" justifyContent="space-between">
      <StackFullWidth direction="column" justifyContent="space-between">
        <StackFullWidth direction="column">
          <Typography variant="subtitle2">{t("name")}</Typography>
          <TypographyWithBottomMargin variant="subtitle1" data-cy="casing-name">
            {item.name ? item.name : "-"}
          </TypographyWithBottomMargin>
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("fromdepth")}</Typography>
            <TypographyWithBottomMargin
              variant="subtitle1"
              data-cy="casing-fromDepth">
              {item.fromDepth || item.fromDepth === 0 ? item.fromDepth : "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("todepth")}</Typography>
            <TypographyWithBottomMargin
              variant="subtitle1"
              data-cy="casing-toDepth">
              {item.toDepth || item.toDepth === 0 ? item.toDepth : "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("kindCasingLayer")}</Typography>
            <TypographyWithBottomMargin
              variant="subtitle1"
              data-cy="casing-kind">
              {item.kind?.[i18n.language] || "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("materialCasingLayer")}</Typography>
            <TypographyWithBottomMargin
              variant="subtitle1"
              data-cy="casing-material">
              {item.material?.[i18n.language] || "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("dateSpudCasing")}</Typography>
            <TypographyWithBottomMargin
              variant="subtitle1"
              data-cy="casing-dateStart">
              {item.dateStart ? formattedDateTime(item.dateStart) : "-"}
            </TypographyWithBottomMargin>
          </StackHalfWidth>
          <StackHalfWidth direction="column">
            <Typography variant="subtitle2">{t("dateFinishCasing")}</Typography>
            <TypographyWithBottomMargin
              variant="subtitle1"
              data-cy="casing-dateFinish">
              {item.dateFinish ? formattedDateTime(item.dateFinish) : "-"}
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
              {item.innerDiameter || item.innerDiameter === 0
                ? item.innerDiameter
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
              {item.outerDiameter || item.outerDiameter === 0
                ? item.outerDiameter
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

export default CasingDisplay;
