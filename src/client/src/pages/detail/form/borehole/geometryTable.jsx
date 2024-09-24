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

import { FullPageCentered } from "../../../../components/styledComponents.ts";

const GeometryTable = ({ data }) => {
  const { t } = useTranslation();

  return (
    <>
      {!data ? (
        <FullPageCentered>
          <CircularProgress />
        </FullPageCentered>
      ) : data.length === 0 ? (
        <Typography>{t("msgBoreholeGeometryEmpty")}</Typography>
      ) : (
        <TableContainer sx={{ aspectRatio: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {Object.keys(data[0]).map(key => (
                  <TableCell key={key} sx={{ fontWeight: 900 }}>
                    {key} {["x", "y", "z", "md"].includes(key) ? "[m]" : ["hazi", "devi"].includes(key) ? "[deg]" : ""}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((element, index) => (
                <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  {Object.keys(element).map(key => (
                    <TableCell key={key}>{element[key]?.toFixed(3) ?? "-"}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default GeometryTable;
