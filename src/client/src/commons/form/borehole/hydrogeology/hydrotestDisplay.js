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
import ObservationDisplay from "./observationDisplay";
import HydrotestResultTable from "./hydrotestResultTable";

const HydrotestDisplay = props => {
  const {
    hydrotest,
    selectedHydrotest,
    setSelectedHydrotest,
    isEditable,
    deleteHydrotest,
  } = props;
  const { t, i18n } = useTranslation();

  return (
    <Card
      key={hydrotest.id}
      sx={{
        border: "1px solid lightgrey",
        borderRadius: "3px",
        p: 1.5,
        mb: 2,
        height: "100%",
      }}>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
            {t("hydrotest")}
          </Typography>
          <ObservationDisplay observation={hydrotest} />
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("hydrotestKind")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {hydrotest.testKind?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("flowDirection")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {hydrotest.codelists
                  .filter(c => c.schema === "htest102")
                  .map(c => c[i18n.language])
                  .join(", ") || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("evaluationMethod")}
              </Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {hydrotest.codelists
                  .filter(c => c.schema === "htest103")
                  .map(c => c[i18n.language])
                  .join(", ") || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          {hydrotest.hydrotestResults?.length > 0 && (
            <>
              <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
                {t("hydrotestResult")}
              </Typography>
              <HydrotestResultTable
                hydrotest={hydrotest}
                isEditable={false}
                isAddingHydrotestResult={false}
                setIsAddingHydrotestResult={() => {}}
                editingId={null}
              />
            </>
          )}
        </StackFullWidth>
        <Stack
          direction="row"
          sx={{
            marginLeft: "auto",
            visibility: isEditable ? "visible" : "hidden",
          }}>
          <Tooltip title={t("edit")}>
            <ModeEditIcon
              color={selectedHydrotest ? "disabled" : "black"}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedHydrotest && setSelectedHydrotest(hydrotest);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedHydrotest ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedHydrotest && deleteHydrotest(hydrotest.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
      <Stack direction="column"></Stack>
    </Card>
  );
};

export default HydrotestDisplay;
