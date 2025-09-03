import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { theme } from "../../../../../../AppTheme.ts";
import { Lithology } from "../../lithology.ts";
import { AddRowButton, DataCell, HeaderCell, HeaderRowContainer } from "../stratigraphyTableComponents.tsx";

interface LithologyContentEditProps {
  lithologies: Lithology[] | undefined;
}

export const LithologyContentEdit: FC<LithologyContentEditProps> = ({ lithologies }) => {
  const { t } = useTranslation();
  // Example data for demonstration
  // Replace with actual data and rendering logic
  const rows = [
    { id: 1, col1: "A", col2: "B", col3: "C", col4: "D" },
    { id: 2, col1: "E", col2: "F", col3: "G", col4: "H" },
  ];
  const numRows = rows.length;

  return (
    <Stack gap={1.5}>
      <Grid
        sx={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: "90px 1fr 1fr 1fr",
          gridTemplateRows: `40px${rows.map(() => " 240px").join("")}`,
          borderTopLeftRadius: theme.spacing(0.5),
          borderTopRightRadius: theme.spacing(0.5),
        }}>
        <HeaderRowContainer gridTemplateColumns="90px 1fr 1fr 1fr">
          <HeaderCell>{t("depth")}</HeaderCell>
          <HeaderCell>{t("lithology")}</HeaderCell>
          <HeaderCell>{t("lithological_description")}</HeaderCell>
          <HeaderCell>{t("facies_description")}</HeaderCell>
        </HeaderRowContainer>
        {/* Data Rows */}
        {rows.map((row, idx) => (
          <>
            {/* 1st column: one entry per row */}
            <DataCell key={`col1-${row.id}`} isLastRow={idx === numRows - 1}>
              {row.col1}
            </DataCell>
            {/* 2nd column: one entry per row */}
            <DataCell key={`col2-${row.id}`} isLastRow={idx === numRows - 1}>
              {row.col2}
            </DataCell>
            {/* 3rd column: can span multiple rows (example: span all rows for the first row) */}
            {idx === 0 && (
              <DataCell key={`col3-${row.id}`} sx={{ gridRow: `span ${rows.length}` }}>
                {rows.map(r => r.col3).join(", ")}
              </DataCell>
            )}
            {/* 4th column: can span multiple rows (example: span all rows for the first row) */}
            {idx === 0 && (
              <DataCell key={`col4-${row.id}`} isLastColumn={true} sx={{ gridRow: `span ${rows.length}` }}>
                {rows.map(r => r.col4).join(", ")}
              </DataCell>
            )}
          </>
        ))}
      </Grid>
      <AddRowButton />
    </Stack>
  );
};
