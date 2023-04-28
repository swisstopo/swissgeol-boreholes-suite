import React from "react";
import { Card, Stack, Tooltip, Typography } from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/system";

const WaterIngressDisplay = props => {
  const {
    waterIngress,
    selectedWaterIngress,
    setSelectedWaterIngress,
    isEditable,
    deleteWaterIngress,
  } = props;
  const { t, i18n } = useTranslation();

  function timesToReadableDuration(startTime, endTime) {
    const timestampStart = new Date(startTime).getTime();
    const timestampEnd = new Date(endTime).getTime();
    const durationInMinutes = (timestampEnd - timestampStart) / 60000;
    if (durationInMinutes < 0) return "-";
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.floor(durationInMinutes % 60);
    let result = "";
    if (hours > 0) {
      result += hours + " " + (hours === 1 ? t("hour") : t("hours")) + " ";
    }
    if (minutes > 0) {
      result += minutes + " " + (minutes === 1 ? t("minute") : t("minutes"));
    }
    return result.trim();
  }

  const formattedDateTime = dateString => {
    const date = new Date(dateString);
    const dateTimeFormat = new Intl.DateTimeFormat("de-CH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });

    return dateTimeFormat.format(date);
  };

  // styled components
  const TypographyWithBottomMargin = styled(Typography)(() => ({
    marginBottom: 6,
  }));
  const StackFullWidth = styled(Stack)(() => ({
    width: "100%",
  }));
  const StackHalfWidth = styled(Stack)(() => ({
    width: "50%",
  }));

  return (
    <Card
      key={waterIngress.id}
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
              <Typography variant="subtitle2">{t("quantity")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.quantity?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("conditions")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.conditions?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("fromDepthM")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.fromDepthM ? waterIngress.fromDepthM : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("toDepthM")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.toDepthM ? waterIngress.toDepthM : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("fromDepthMasl")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.fromDepthMasl ? waterIngress.fromDepthMasl : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("toDepthMasl")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.toDepthMasl ? waterIngress.toDepthMasl : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("startTime")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.startTime
                  ? formattedDateTime(waterIngress.startTime)
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("endTime")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.endTime
                  ? formattedDateTime(waterIngress.endTime)
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <Typography variant="subtitle2"> {t("duration")}</Typography>
          <TypographyWithBottomMargin variant="subtitle1">
            {waterIngress.startTime && waterIngress.endTime
              ? timesToReadableDuration(
                  waterIngress.startTime,
                  waterIngress.endTime,
                )
              : "-"}
          </TypographyWithBottomMargin>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("reliability")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.reliability?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("completionFinished")}
              </Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {waterIngress.completionFinished === null
                  ? "-"
                  : waterIngress.completionFinished === true
                  ? t("yes")
                  : t("no")}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <Typography variant="subtitle2"> {t("casing")}</Typography>
          <TypographyWithBottomMargin variant="subtitle1">
            {waterIngress.casing?.name || "-"}
          </TypographyWithBottomMargin>
          <Typography variant="subtitle2">{t("comment")}</Typography>
          <TypographyWithBottomMargin
            variant="subtitle1"
            sx={{
              display: "-webkit-box",
              overflow: "auto",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
            }}>
            {waterIngress.comment || "-"}
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
              color={selectedWaterIngress ? "disabled" : "black"}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedWaterIngress && setSelectedWaterIngress(waterIngress);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedWaterIngress ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedWaterIngress && deleteWaterIngress(waterIngress.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
      <Stack direction="column"></Stack>
    </Card>
  );
};

export default WaterIngressDisplay;
