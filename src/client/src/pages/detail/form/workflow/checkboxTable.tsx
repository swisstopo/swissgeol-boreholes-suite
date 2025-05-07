import { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { capitalizeFirstLetter } from "../../../../utils.ts";
import { TabStatus } from "./workflow.ts";

const tableStructure = [
  {
    groupLabel: "borehole",
    fields: ["general", "section", "geometry"],
  },
  {
    groupLabel: "stratigraphy",
    fields: ["lithology", "chronostratigraphy", "lithostratigraphy"],
  },
  {
    groupLabel: "completion",
    fields: ["casing", "instrumentation", "backfill"],
  },
  {
    groupLabel: "hydrogeology",
    fields: ["waterIngress", "groundwater", "fieldMeasurement", "hydrotest"],
  },
  {
    groupLabel: "attachments",
    fields: ["profile", "photo"],
  },
];

export const CheckboxTable: FC<{ tabStatus?: TabStatus; checkAllTitle: string }> = ({ tabStatus, checkAllTitle }) => {
  const { t } = useTranslation();
  if (!tabStatus) return null;

  const cellBorderStyle = { borderBottom: `1px solid ${theme.palette.border.darker}` };
  const firstColumnCellStyle = { width: "1%", whiteSpace: "nowrap" };

  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <Table size="small">
        <TableHead
          sx={{
            border: `1px solid ${theme.palette.border.light}`,
            backgroundColor: theme.palette.border.light,
          }}>
          <TableRow>
            <TableCell sx={{ py: 1.5, px: 2, fontWeight: "bold", ...firstColumnCellStyle }}>{"Tab"}</TableCell>
            <TableCell align="left">
              <FormControlLabel
                label={<Typography fontWeight="bold">{t(`statuses.${checkAllTitle}`)}</Typography>}
                control={<Checkbox disabled />}
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            border: `1px solid ${theme.palette.border.darker}`,
            borderTop: `2px solid ${theme.palette.border.darker}`,
          }}>
          {tableStructure.map(section => (
            <Fragment key={section.groupLabel}>
              <TableRow sx={{ backgroundColor: theme.palette.background.grey }}>
                <TableCell sx={{ py: 1, px: 2, ...cellBorderStyle }} colSpan={2}>
                  <Typography>{capitalizeFirstLetter(t(section.groupLabel))}</Typography>
                </TableCell>
              </TableRow>
              {section.fields.map(field => (
                <TableRow key={field}>
                  <TableCell sx={{ pl: 2, pr: 20, ...cellBorderStyle, ...firstColumnCellStyle }}>
                    <Typography ml={2} color={theme.palette.action.disabled}>
                      {t(field)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellBorderStyle}>
                    <Checkbox sx={{ p: 0 }} checked={tabStatus[field as keyof TabStatus] as boolean} disabled />
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
