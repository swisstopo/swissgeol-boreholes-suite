import { useTranslation } from "react-i18next";
import { TableCell } from "@mui/material";
import { FormResultTableDisplay } from "../../../../components/form/formResultTableDisplay";
import { StackFullWidth } from "../../../../components/styledComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";
import { getHydrotestParameterUnits } from "./parameterUnits";
import { deleteHydrotest, useDomains } from "../../../../api/fetchApiV2";

const HydrotestDisplay = props => {
  const { item, isEditable } = props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteHydrotest}>
      <ObservationDisplay observation={item} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="hydrotestKind" value={item?.kindCodelists} type={FormDisplayType.Domain} />
        <FormDisplay label="flowDirection" value={item?.flowDirectionCodelists} type={FormDisplayType.Domain} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="evaluationMethod" value={item?.evaluationMethodCodelists} type={FormDisplayType.Domain} />
      </StackFullWidth>
      {item?.hydrotestResults?.length > 0 && (
        <FormResultTableDisplay
          title={t("hydrotestResult")}
          results={item?.hydrotestResults}
          renderHeader={styles => (
            <>
              <TableCell sx={{ ...styles, paddingRight: 0 }}>{t("parameter")}</TableCell>
              <TableCell sx={styles}>{t("value")}</TableCell>
              <TableCell sx={styles}>{t("minValue")}</TableCell>
              <TableCell sx={styles}>{t("maxValue")}</TableCell>
            </>
          )}
          renderBody={(result, index, styles) => (
            <>
              <TableCell
                component="th"
                scope="row"
                sx={{
                  ...styles,
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
                {domains?.data?.find(d => d.id === result.parameterId)?.[i18n.language] || ""}
              </TableCell>
              <TableCell sx={styles} data-cy={`hydrotestResult.${index}.value-formDisplay`}>
                {result?.value && (
                  <>
                    <span>{result?.value + " "}</span>
                    {getHydrotestParameterUnits(result.parameterId, domains.data)}
                  </>
                )}
              </TableCell>
              <TableCell sx={styles} data-cy={`hydrotestResult.${index}.minValue-formDisplay`}>
                {result?.minValue && (
                  <>
                    <span>{result?.minValue + " "}</span>
                    {getHydrotestParameterUnits(result.parameterId, domains.data)}
                  </>
                )}
              </TableCell>
              <TableCell sx={styles} data-cy={`hydrotestResult.${index}.maxValue-formDisplay`}>
                {result?.maxValue && (
                  <>
                    <span>{result?.maxValue + " "}</span>
                    {getHydrotestParameterUnits(result.parameterId, domains.data)}
                  </>
                )}
              </TableCell>
            </>
          )}
        />
      )}
    </DataDisplayCard>
  );
};

export default HydrotestDisplay;
