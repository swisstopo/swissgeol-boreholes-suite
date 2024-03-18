import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHead, TableBody, TableContainer, TableRow, TableCell, Typography } from "@mui/material";

interface FormResultTableDisplayProps {
  title: string;
  results: any[];
  renderBody: (result: any, index: number, styles: React.CSSProperties) => ReactNode;
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
    paddingRight: "3px",
    paddingLeft: "3px",
    flex: 1,
    width: "20%",
    maxWidth: "20%",
    fontSize: "13px",
  };

  const tableHeaderStyles: React.CSSProperties = {
    fontWeight: 900,
    padding: "3px",
    flex: 1,
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
            {results?.map((result: any, index: number) => (
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
