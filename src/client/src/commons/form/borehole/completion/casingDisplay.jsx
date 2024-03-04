import { useTranslation } from "react-i18next";
import { Table, TableHead, TableBody, TableContainer, TableRow, TableCell, Typography } from "@mui/material";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import { useDomains } from "../../../../api/fetchApiV2";
import { extractCasingDepth } from "./casing";

const CasingDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();

  const tableCellStyles = {
    paddingRight: "3px",
    paddingLeft: "3px",
    flex: 1,
    fontSize: "13px",
  };

  const tableHeaderStyles = {
    fontWeight: 900,
    padding: "3px",
    flex: 1,
  };

  var depth = extractCasingDepth(item);

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
      <FormDisplay label="name" value={item?.name} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="fromdepth" value={depth.min} type={FormDisplayType.Number} />
        <FormDisplay label="todepth" value={depth.max} type={FormDisplayType.Number} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="dateStartCasing" value={item?.dateStart} type={FormDisplayType.Date} />
        <FormDisplay label="dateFinishCasing" value={item?.dateFinish} type={FormDisplayType.Date} />
      </StackFullWidth>
      <FormDisplay label="notes" value={item?.notes} />
      <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("casingElements")}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...tableHeaderStyles, border: "none" }} colSpan={2}>
                {t("depthMD")}
              </TableCell>
              <TableCell sx={tableHeaderStyles} rowSpan={2}>
                {t("kindCasingLayer")}
              </TableCell>
              <TableCell sx={tableHeaderStyles} rowSpan={2}>
                {t("materialCasingLayer")}
              </TableCell>
              <TableCell sx={{ ...tableHeaderStyles, border: "none" }} colSpan={2}>
                {t("diameter")}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ ...tableHeaderStyles }}>{t("from")}</TableCell>
              <TableCell sx={tableHeaderStyles}>{t("to")}</TableCell>
              <TableCell sx={tableHeaderStyles}>{t("inner")}</TableCell>
              <TableCell sx={tableHeaderStyles}>{t("outer")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {item?.casingElements
              ?.sort((a, b) => a.fromDepth - b.fromDepth)
              .map((element, index) => (
                <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={tableCellStyles}
                    data-cy={`casingElements.${index}.fromDepth-formDisplay`}>
                    {element.fromDepth}
                  </TableCell>
                  <TableCell sx={tableCellStyles} data-cy={`casingElements.${index}.toDepth-formDisplay`}>
                    {element.toDepth}
                  </TableCell>
                  <TableCell sx={tableCellStyles} data-cy={`casingElements.${index}.kindId-formDisplay`}>
                    {domains?.data?.find(d => d.id === element.kindId)?.[i18n.language] || ""}
                  </TableCell>
                  <TableCell sx={tableCellStyles} data-cy={`casingElements.${index}.materialId-formDisplay`}>
                    {domains?.data?.find(d => d.id === element.materialId)?.[i18n.language] || ""}
                  </TableCell>
                  <TableCell sx={tableCellStyles} data-cy={`casingElements.${index}.innerDiameter-formDisplay`}>
                    {element.innerDiameter}
                  </TableCell>
                  <TableCell sx={tableCellStyles} data-cy={`casingElements.${index}.outerDiameter-formDisplay`}>
                    {element.outerDiameter}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DataDisplayCard>
  );
};

export default CasingDisplay;
