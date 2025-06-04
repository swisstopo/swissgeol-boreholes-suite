import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TableCell } from "@mui/material";
import { Codelist, useCodelists } from "../../../../../components/codelist.ts";
import DataDisplayCard from "../../../../../components/dataCard/dataDisplayCard.tsx";
import { FormResultTableDisplay } from "../../../../../components/form/formResultTableDisplay.js";
import { parameterTableHeaderStyles } from "../../../../../components/form/formResultTableDisplayStyles.js";
import { formatNumberForDisplay } from "../../../../../components/form/formUtils.ts";
import ObservationDisplay from "../observationDisplay.tsx";
import { getFieldMeasurementParameterUnits } from "../parameterUnits.js";
import { deleteFieldMeasurement, FieldMeasurement, FieldMeasurementResult } from "./FieldMeasurement.ts";

export const FieldMeasurementDisplay: FC<{ item: FieldMeasurement }> = ({ item }) => {
  const codelists = useCodelists();
  const { t, i18n } = useTranslation();

  return (
    <DataDisplayCard<FieldMeasurement> item={item} deleteData={deleteFieldMeasurement}>
      <ObservationDisplay observation={item} />
      <FormResultTableDisplay<FieldMeasurementResult>
        title={t("fieldMeasurementResult")}
        results={item?.fieldMeasurementResults}
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
              {codelists?.data?.find((d: Codelist) => d.id === result.sampleTypeId)?.[i18n.language] ?? ""}
            </TableCell>
            <TableCell
              component="th"
              scope="row"
              sx={{
                ...styles,
                ...parameterTableHeaderStyles,
              }}
              data-cy={`fieldMeasurementResult.${index}.parameter-formDisplay`}>
              {codelists?.data?.find((d: Codelist) => d.id === result.parameterId)?.[i18n.language] ?? ""}
            </TableCell>
            <TableCell sx={styles} data-cy={`fieldMeasurementResult.${index}.value-formDisplay`}>
              {result?.value && result?.parameterId && (
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

export default FieldMeasurementDisplay;
