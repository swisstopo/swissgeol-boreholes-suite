import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import { FieldMeasurementResult } from "../../pages/detail/form/hydrogeology/FieldMeasurementInterface.ts";
import { HydrotestResult } from "../../pages/detail/form/hydrogeology/HydrotestInterface.ts";

interface FormResultTableDisplayProps {
  title: string;
  results: HydrotestResult[] | FieldMeasurementResult[];
  renderBody: (
    result: HydrotestResult | FieldMeasurementResult,
    index: number,
    styles: React.CSSProperties,
  ) => ReactNode;
  renderHeader: (styles: React.CSSProperties) => ReactNode;
}

export const FormResultTableDisplay: React.FC<FormResultTableDisplayProps> = ({
  title,
  results,
  renderBody,
  renderHeader,
}) => {
  const { t } = useTranslation();

  const tableCellStyles: React.CSSProperties = {
    width: "20%",
    maxWidth: "20%",
  };

  const tableHeaderStyles: React.CSSProperties = {
    width: "20%",
    maxWidth: "20%",
  };

  return (
    <>
      <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t(title)}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>{renderHeader(tableHeaderStyles)}</TableRow>
          </TableHead>
          <TableBody>
            {results?.map((result: HydrotestResult | FieldMeasurementResult, index: number) => (
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
