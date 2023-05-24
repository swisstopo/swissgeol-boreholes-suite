import React from "react";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  StackFullWidth,
  StackHalfWidth,
  TypographyWithBottomMargin,
} from "./styledComponents";

const ObservationDisplay = props => {
  const { observation } = props;
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

  return (
    <>
      {observation != null && (
        <>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("fromdepth")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.fromDepthM || observation.fromDepthM === 0
                  ? observation.fromDepthM
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("todepth")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.toDepthM || observation.toDepthM === 0
                  ? observation.toDepthM
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("fromDepthMasl")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.fromDepthMasl || observation.fromDepthMasl === 0
                  ? observation.fromDepthMasl
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("toDepthMasl")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.toDepthMasl || observation.toDepthMasl === 0
                  ? observation.toDepthMasl
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("startTime")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.startTime
                  ? formattedDateTime(observation.startTime)
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2"> {t("endTime")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.endTime
                  ? formattedDateTime(observation.endTime)
                  : "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <Typography variant="subtitle2"> {t("duration")}</Typography>
          <TypographyWithBottomMargin variant="subtitle1">
            {observation.startTime && observation.endTime
              ? timesToReadableDuration(
                  observation.startTime,
                  observation.endTime,
                )
              : "-"}
          </TypographyWithBottomMargin>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("reliability")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.reliability?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("completionFinished")}
              </Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {observation.completionFinished === null
                  ? "-"
                  : observation.completionFinished === true
                  ? t("yes")
                  : t("no")}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <Typography variant="subtitle2"> {t("casing")}</Typography>
          <TypographyWithBottomMargin variant="subtitle1">
            {observation.casing?.name || "-"}
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
            {observation.comment || "-"}
          </TypographyWithBottomMargin>
        </>
      )}
    </>
  );
};

export default ObservationDisplay;
