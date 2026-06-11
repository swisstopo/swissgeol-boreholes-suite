import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TableCell } from "@mui/material";
import { Codelist, FieldMeasurement, FieldMeasurementResult } from "../../../../../api/generated";
import { useCodelistLocalizedLabel, useCodelists } from "../../../../../components/codelist.ts";
import { DataDisplayCard } from "../../../../../components/dataCard/dataDisplayCard.tsx";
import { FormResultTableDisplay } from "../../../../../components/form/formResultTableDisplay.js";
import { parameterTableHeaderStyles } from "../../../../../components/form/formResultTableDisplayStyles.js";
import { formatNumberForDisplay } from "../../../../../components/form/formUtils.ts";
import ObservationDisplay from "../observationDisplay.tsx";
import { getFieldMeasurementParameterUnits } from "../parameterUnits.js";
import { deleteFieldMeasurement } from "./FieldMeasurement.ts";

export const FieldMeasurementDisplay: FC<{ item: FieldMeasurement }> = ({ item }) => {
  const codelists = useCodelists();
  const { t } = useTranslation();
  const getCodelistLabel = useCodelistLocalizedLabel();

  return (
    <DataDisplayCard<FieldMeasurement> item={item} deleteData={deleteFieldMeasurement} entityName={"fieldMeasurement"}>
      <ObservationDisplay observation={item} />
      <FormResultTableDisplay<FieldMeasurementResult>
        title={t("fieldMeasurementResult")}
        results={item?.fieldMeasurementResults ?? []}
        renderHeader={styles => (
          <>
            <TableCell sx={{ ...styles, paddingRight: 0 }}>{t("fieldMeasurementSampleType")}</TableCell>
            <TableCell sx={styles}>{t("parameter")}</TableCell>
            <TableCell sx={styles}>{t("value")}</TableCell>
          </>
        )}
        renderBody={(result, index, styles) => (
          <>
            <TableCell sx={styles} data-cy={`fieldMeasurementResult.${index}.sampleType-formDisplay`}>
              {getCodelistLabel(codelists.data?.find((d: Codelist) => d.id === result.sampleTypeId))}
            </TableCell>
            <TableCell
              component="th"
              scope="row"
              sx={{
                ...styles,
                ...parameterTableHeaderStyles,
              }}
              data-cy={`fieldMeasurementResult.${index}.parameter-formDisplay`}>
              {getCodelistLabel(codelists.data?.find((d: Codelist) => d.id === result.parameterId))}
            </TableCell>
            <TableCell sx={styles} data-cy={`fieldMeasurementResult.${index}.value-formDisplay`}>
              {result?.value != null && result?.parameterId != null && (
                <>
                  <span>{formatNumberForDisplay(result?.value) + " "}</span>
                  {getFieldMeasurementParameterUnits(result.parameterId, codelists.data)}
                </>
              )}
            </TableCell>
          </>
        )}
      />
    </DataDisplayCard>
  );
};
