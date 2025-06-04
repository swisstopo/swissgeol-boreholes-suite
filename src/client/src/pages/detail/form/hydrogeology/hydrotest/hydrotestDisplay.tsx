import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TableCell } from "@mui/material";
import { Codelist, useCodelists } from "../../../../../components/codelist.ts";
import DataDisplayCard from "../../../../../components/dataCard/dataDisplayCard.js";
import { FormContainer, FormDisplay, FormValueType } from "../../../../../components/form/form.ts";
import { FormResultTableDisplay } from "../../../../../components/form/formResultTableDisplay.tsx";
import { parameterTableHeaderStyles } from "../../../../../components/form/formResultTableDisplayStyles.ts";
import { formatNumberForDisplay } from "../../../../../components/form/formUtils.ts";
import ObservationDisplay from "../observationDisplay.tsx";
import { getHydrotestParameterUnits } from "../parameterUnits.tsx";
import { deleteHydrotest, Hydrotest, HydrotestResult } from "./Hydrotest.ts";

export const HydrotestDisplay: FC<{ item: Hydrotest }> = ({ item }) => {
  const { t, i18n } = useTranslation();
  const codelists = useCodelists();

  return (
    <DataDisplayCard<Hydrotest> item={item} deleteData={deleteHydrotest}>
      <ObservationDisplay observation={item} />
      <FormContainer direction="row">
        <FormDisplay label="hydrotestKind" value={item?.kindCodelists ?? null} type={FormValueType.Domain} />
        <FormDisplay label="flowDirection" value={item?.flowDirectionCodelists ?? null} type={FormValueType.Domain} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay
          label="evaluationMethod"
          value={item?.evaluationMethodCodelists ?? null}
          type={FormValueType.Domain}
        />
      </FormContainer>
      {item?.hydrotestResults?.length > 0 && (
        <FormResultTableDisplay<HydrotestResult>
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
                  ...parameterTableHeaderStyles,
                }}
                data-cy={`hydrotestResult.${index}.parameter-formDisplay`}>
                {codelists?.data?.find((d: Codelist) => d.id === result.parameterId)?.[i18n.language] ?? ""}
              </TableCell>
              <TableCell sx={styles} data-cy={`hydrotestResult.${index}.value-formDisplay`}>
                {result?.value && (
                  <>
                    <span>{formatNumberForDisplay(result?.value) + " "}</span>
                    {getHydrotestParameterUnits(result.parameterId, codelists.data)}
                  </>
                )}
              </TableCell>
              <TableCell sx={styles} data-cy={`hydrotestResult.${index}.minValue-formDisplay`}>
                {result?.minValue && (
                  <>
                    <span>{formatNumberForDisplay(result?.minValue) + " "}</span>
                    {getHydrotestParameterUnits(result.parameterId, codelists.data)}
                  </>
                )}
              </TableCell>
              <TableCell sx={styles} data-cy={`hydrotestResult.${index}.maxValue-formDisplay`}>
                {result?.maxValue && (
                  <>
                    <span>{formatNumberForDisplay(result?.maxValue) + " "}</span>
                    {getHydrotestParameterUnits(result.parameterId, codelists.data)}
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
