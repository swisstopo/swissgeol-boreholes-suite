import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { FieldMeasurementResult } from "../../pages/detail/form/hydrogeology/fieldMeasurement/FieldMeasurement.ts";
import { HydrotestResult } from "../../pages/detail/form/hydrogeology/hydrotest/Hydrotest.ts";
import { tableCellStyles, tableHeaderStyles } from "./formResultTableDisplayStyles.ts";

type TestResults = HydrotestResult | FieldMeasurementResult;

interface FormResultTableDisplayProps<T extends TestResults> {
  title: string;
  results: T[];
  renderBody: (result: T, index: number, styles: React.CSSProperties) => ReactNode; // Ensures T is correctly passed
  renderHeader: (styles: React.CSSProperties) => ReactNode;
}

export const FormResultTableDisplay = <T extends TestResults>({
  title,
  results,
  renderBody,
  renderHeader,
}: FormResultTableDisplayProps<T>) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t(title)}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>{renderHeader(tableHeaderStyles)}</TableRow>
          </TableHead>
          <TableBody>
            {results?.map((result, index) => (
              <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                {renderBody(result, index, tableCellStyles)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
