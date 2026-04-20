import { FC, useCallback, useContext, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { Identifier, useBorehole } from "../../../../api/borehole.ts";
import { theme } from "../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../components/boreholesCard.tsx";
import { AddButton, AddRowButton, StandaloneIconButton } from "../../../../components/buttons/buttons.tsx";
import { useCodelists } from "../../../../components/codelist.ts";
import {
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormInputDisplayOnly,
  FormValueType,
} from "../../../../components/form/form.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { BaseForm } from "../baseForm.tsx";
import { IdentifiersFormInputs, IdentifiersFormSubmission } from "./identifiersPanelInterfaces.ts";

export const IdentifiersPanel: FC = () => {
  const { id } = useRequiredParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { data: borehole } = useBorehole(Number.parseInt(id, 10));
  const { editingEnabled } = useContext(EditStateContext);
  const { data: codelists } = useCodelists();

  const formMethods = useForm<IdentifiersFormInputs>({
    mode: "onChange",
    defaultValues: {
      boreholeCodelists: borehole?.boreholeCodelists ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray<IdentifiersFormInputs, "boreholeCodelists">({
    name: "boreholeCodelists",
    control: formMethods.control,
  });

  const watchedCodelists = formMethods.watch("boreholeCodelists");

  // Group field indices by codelistId to render one card per ID Type
  const groupedByCodelistId = useMemo(() => {
    const groups: { codelistId: number | null; indices: number[] }[] = [];
    fields.forEach((field, index) => {
      const cId = watchedCodelists?.[index]?.codelistId ?? field.codelistId;
      const existing = groups.find(g => g.codelistId === cId);
      if (existing) {
        existing.indices.push(index);
      } else {
        groups.push({ codelistId: cId, indices: [index] });
      }
    });
    return groups;
  }, [fields, watchedCodelists]);

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
    <BoreholesCard
      title={t("ids")}
      action={
        editingEnabled && (
          <AddButton
            label="addIdentifier"
            variant={"contained"}
            onClick={() => {
              append({ boreholeId: borehole.id, codelistId: null, value: "", comment: null });
            }}
          />
        )
      }>
      <BaseForm
        formMethods={formMethods}
        prepareDataForSubmit={prepareIdentifiersDataForSubmit}
        tabStatusToReset="identifiers"
        triggerValidationBeforeSave={true}>
        <Stack gap={3} mr={2}>
          <BoreholesCard title={editingEnabled ? t("borehole_technical_id") : undefined}>
            <FormSegmentBox>
              <Stack direction={"row"} gap={2} justifyContent={"space-between"}>
                <FormContainer direction={"column"} gap={2}>
                  <FormContainer direction={"row"} gap={2}>
                    <FormInputDisplayOnly label={"borehole_identifier"} value={t("borehole_technical_id")} />
                    <FormInputDisplayOnly label={"borehole_identifier_value"} value={borehole.id} />
                  </FormContainer>
                </FormContainer>
              </Stack>
            </FormSegmentBox>
          </BoreholesCard>
          {groupedByCodelistId.map(group => {
            const firstIndex = group.indices[0];
            const firstField = fields[firstIndex];
            return (
              <BoreholesCard
                key={firstField.id}
                action={
                  editingEnabled && (
                    <StandaloneIconButton
                      icon={<Trash2 />}
                      onClick={() => {
                        // Remove all indices in this group (in reverse to keep indices stable)
                        const sortedDesc = [...group.indices].sort((a, b) => b - a);
                        sortedDesc.forEach(i => remove(i));
                      }}
                      data-cy={`boreholeCodelists.${firstIndex}.deleteCard`}
                      color={"primaryInverse"}
                    />
                  )
                }
                title={String(
                  (editingEnabled &&
                    codelists?.find(d => d.id === watchedCodelists?.[firstIndex]?.codelistId)?.[i18n.language]) ||
                    "",
                )}>
                <FormSegmentBox>
                  <FormContainer direction={"column"} gap={2}>
                    <FormDomainSelect
                      fieldName={`boreholeCodelists.${firstIndex}.codelistId`}
                      label="borehole_identifier"
                      required={true}
                      selected={firstField.codelistId}
                      schemaName="borehole_identifier"
                      prefilteredDomains={codelists
                        ?.filter(d => d.schema === "borehole_identifier")
                        .filter(
                          d =>
                            d.id === group.codelistId ||
                            !groupedByCodelistId.some(g => g !== group && g.codelistId === d.id),
                        )}
                    />
                    {group.indices.map(index => (
                      <FormContainer direction={"row"} gap={2} key={fields[index].id} alignItems={"flex-start"}>
                        <FormInput
                          fieldName={`boreholeCodelists.${index}.value`}
                          label="borehole_identifier_value"
                          required={true}
                          value={fields[index].value}
                          type={FormValueType.Text}
                        />
                        <FormInput
                          fieldName={`boreholeCodelists.${index}.comment`}
                          label="comment"
                          value={fields[index].comment ?? ""}
                          type={FormValueType.Text}
                        />
                        {editingEnabled && (
                          <StandaloneIconButton
                            icon={<Trash2 />}
                            sx={{ mt: 2 }}
                            onClick={() => remove(index)}
                            data-cy={`boreholeCodelists.${index}.delete`}
                            color={"primaryInverse"}
                          />
                        )}
                      </FormContainer>
                    ))}
                    {editingEnabled && (
                      <AddRowButton
                        dataCy={`${watchedCodelists?.[firstIndex]?.codelistId}-add-id-button`}
                        onClick={() => {
                          append({
                            boreholeId: borehole.id,
                            codelistId: watchedCodelists?.[firstIndex]?.codelistId ?? firstField.codelistId,
                            value: "",
                            comment: null,
                          });
                        }}
                        buttonContent={
                          <Stack
                            direction={"row"}
                            gap={1}
                            justifyContent={"space-between"}
                            sx={{ color: theme.palette.primary.main }}>
                            <Plus />
                            <Typography variant="body2">{t("addIDCodeAndComment")}</Typography>
                          </Stack>
                        }
                      />
                    )}
                  </FormContainer>
                </FormSegmentBox>
              </BoreholesCard>
            );
          })}
        </Stack>
      </BaseForm>
    </BoreholesCard>
  );
};
