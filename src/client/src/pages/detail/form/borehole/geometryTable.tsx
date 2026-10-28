import { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material/";
import { BoreholeGeometryElement } from "../../../../api/generated";
import { formatNumberForDisplay } from "../../../../components/form/formUtils.ts";
import { FullPageCentered } from "../../../../components/styledComponents.ts";

interface GeometryTableProps {
  data: BoreholeGeometryElement[] | undefined;
}

const getUnit = (key: string) => {
  if (["x", "y", "z", "md"].includes(key)) return "[m]";
  if (["hazi", "devi"].includes(key)) return "[deg]";
  return "";
};

const GeometryTable: FC<GeometryTableProps> = ({ data }) => {
  const { t } = useTranslation();

  if (!data) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  if (data.length === 0) {
    return <Typography>{t("msgBoreholeGeometryEmpty")}</Typography>;
  }

  return (
    <TableContainer sx={{ aspectRatio: 1 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {Object.keys(data[0]).map(key => (
              <TableCell key={key} sx={{ fontWeight: 900 }}>
                {key} {getUnit(key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* The rows are never reordered, inserted or removed, so the index identifies a point. */}
          {data.map((element, index) => (
            <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              {/* Object.keys only returns keys of the element, so the lookup cannot miss. */}
              {Object.keys(element).map(key => (
                <TableCell key={key}>{formatNumberForDisplay(element[key as keyof BoreholeGeometryElement])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GeometryTable;
