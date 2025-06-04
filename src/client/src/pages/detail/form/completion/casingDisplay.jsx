import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { deleteCasing } from "../../../../api/fetchApiV2.js";
import { useCodelists } from "../../../../components/codelist.js";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.tsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { formatNumberForDisplay } from "../../../../components/form/formUtils.js";
import { extractCasingDepth } from "./casingUtils";

const CasingDisplay = props => {
  const { item } = props;
  const { t, i18n } = useTranslation();
  const codelists = useCodelists();

  var depth = extractCasingDepth(item);

  return (
    <DataDisplayCard item={item} deleteData={deleteCasing}>
      <FormDisplay label="name" value={item?.name} />
      <FormContainer direction="row">
        <FormDisplay label="fromdepth" value={depth.min} type={FormValueType.Number} />
        <FormDisplay label="todepth" value={depth.max} type={FormValueType.Number} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="dateStartCasing" value={item?.dateStart} type={FormValueType.Date} />
        <FormDisplay label="dateFinishCasing" value={item?.dateFinish} type={FormValueType.Date} />
      </FormContainer>
      <FormDisplay label="notes" value={item?.notes} />
      <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("casingElements")}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "none" }} colSpan={2}>
                {t("depthMD")}
              </TableCell>
              <TableCell rowSpan={2}>{t("kindCasingLayer")}</TableCell>
              <TableCell rowSpan={2}>{t("materialCasingLayer")}</TableCell>
              <TableCell sx={{ border: "none" }} colSpan={2}>
                {t("diameter")}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("from")}</TableCell>
              <TableCell>{t("to")}</TableCell>
              <TableCell>{t("inner")}</TableCell>
              <TableCell>{t("outer")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {item?.casingElements
              ?.sort((a, b) => a.fromDepth - b.fromDepth)
              .map((element, index) => (
                <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row" data-cy={`casingElements.${index}.fromDepth-formDisplay`}>
                    {formatNumberForDisplay(element.fromDepth)}
                  </TableCell>
                  <TableCell data-cy={`casingElements.${index}.toDepth-formDisplay`}>
                    {formatNumberForDisplay(element.toDepth)}
                  </TableCell>
                  <TableCell data-cy={`casingElements.${index}.kindId-formDisplay`}>
                    {codelists?.data?.find(d => d.id === element.kindId)?.[i18n.language] ?? ""}
                  </TableCell>
                  <TableCell data-cy={`casingElements.${index}.materialId-formDisplay`}>
                    {codelists?.data?.find(d => d.id === element.materialId)?.[i18n.language] ?? ""}
                  </TableCell>
                  <TableCell data-cy={`casingElements.${index}.innerDiameter-formDisplay`}>
                    {formatNumberForDisplay(element.innerDiameter)}
                  </TableCell>
                  <TableCell data-cy={`casingElements.${index}.outerDiameter-formDisplay`}>
                    {formatNumberForDisplay(element.outerDiameter)}
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
