import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Stack } from "@mui/material";
import { Identifier, useBorehole } from "../../../../api/borehole.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { BaseForm } from "../baseForm.tsx";
import IdentifierSegment from "./identifierSegment.tsx";
import { IdentifiersFormInputs, IdentifiersFormSubmission } from "./identifiersPanelInterfaces.ts";

export const IdentifiersPanel: FC = () => {
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id, 10));

  const formMethods = useForm<IdentifiersFormInputs>({
    mode: "onChange",
    defaultValues: {
      boreholeCodelists: borehole?.boreholeCodelists ?? [],
    },
  });

  const prepareIdentifiersDataForSubmit = useCallback((formInputs: IdentifiersFormInputs) => {
    const data = { ...formInputs } as unknown as IdentifiersFormSubmission;

    const getCompleteCodelists = (codelists: Identifier[]) => {
      return codelists
        .map(c => {
          delete c.borehole;
          delete c.codelist;
          return c;
        })
        .filter(c => c.codelistId && c.value && c.boreholeId);
    };

    data.boreholeCodelists = getCompleteCodelists(data.boreholeCodelists);
    data.workflow = null;
    return data;
  }, []);

  if (!borehole) return null;

  return (
    <BaseForm
      formMethods={formMethods}
      prepareDataForSubmit={prepareIdentifiersDataForSubmit}
      tabStatusToReset="identifiers">
      <Stack gap={3} mr={2}>
        <IdentifierSegment borehole={borehole} formMethods={formMethods} />
      </Stack>
    </BaseForm>
  );
};
