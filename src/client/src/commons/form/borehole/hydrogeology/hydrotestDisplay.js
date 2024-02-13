import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHead,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
} from "@mui/material";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { TestResultParameterUnits } from "./parameterUnits";
import { useDomains } from "../../../../api/fetchApiV2";

const HydrotestDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();

  const getParameterUnit = parameterId => {
    return TestResultParameterUnits[
      domains?.data?.find(d => d.id === parameterId).geolcode
    ];
  };

  const tableCellStyles = {
    paddingRight: "3px",
    paddingLeft: "3px",
    flex: 1,
    width: "20%",
    maxWidth: "20%",
    fontSize: "13px",
  };

  const tableHeaderStyles = {
    fontWeight: 900,
    padding: "3px",
    flex: 1,
    width: "20%",
    maxWidth: "20%",
  };

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
      <ObservationDisplay observation={item} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay
          label="testKind"
          value={item?.codelists.filter(
            c => c.schema === hydrogeologySchemaConstants.hydrotestKind,
          )}
          type={FormDisplayType.Domain}
        />
        <FormDisplay
          label="flowDirection"
          value={item?.codelists.filter(
            c =>
              c.schema === hydrogeologySchemaConstants.hydrotestFlowDirection,
          )}
          type={FormDisplayType.Domain}
        />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay
          label="evaluationMethod"
          value={item?.codelists.filter(
            c =>
              c.schema ===
              hydrogeologySchemaConstants.hydrotestEvaluationMethod,
          )}
          type={FormDisplayType.Domain}
        />
      </StackFullWidth>
      {item?.hydrotestResults?.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...tableHeaderStyles, paddingRight: 0 }}>
                  {t("parameter")}
                </TableCell>
                <TableCell sx={tableHeaderStyles}>{t("value")}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t("minValue")}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t("maxValue")}</TableCell>
                {isEditable && (
                  <TableCell align="right" sx={{ padding: "3px" }}></TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {item?.hydrotestResults?.map((result, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      ...tableCellStyles,
                      "& .MuiFormControl-root": {
                        minWidth: "100%",
                        maxWidth: "100%",
                      },
                      pr: "3px",
                      pl: "3px",
                      maxWidth: "200px",
                      minWidth: "200px",
                    }}
                    data-cy={`hydrotestResult.${index}.parameter-formDisplay`}>
                    {domains?.data?.find(d => d.id === result.parameterId)?.[
                      i18n.language
                    ] || ""}
                  </TableCell>
                  <TableCell
                    sx={tableCellStyles}
                    data-cy={`hydrotestResult.${index}.value-formDisplay`}>
                    {result?.value && (
                      <>
                        <span>{result?.value + " "}</span>
                        {getParameterUnit(result.parameterId)}
                      </>
                    )}
                  </TableCell>
                  <TableCell
                    sx={tableCellStyles}
                    data-cy={`hydrotestResult.${index}.minValue-formDisplay`}>
                    {result?.minValue && (
                      <>
                        <span>{result?.minValue + " "}</span>
                        {getParameterUnit(result.parameterId)}
                      </>
                    )}
                  </TableCell>
                  <TableCell
                    sx={tableCellStyles}
                    data-cy={`hydrotestResult.${index}.maxValue-formDisplay`}>
                    {result?.maxValue && (
                      <>
                        <span>{result?.maxValue + " "}</span>
                        {getParameterUnit(result.parameterId)}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataDisplayCard>
  );
};

export default HydrotestDisplay;
