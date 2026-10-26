import { FC, useContext, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Checkbox, Divider, FormControlLabel, IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { addSection, updateSection } from "../../../../api/fetchApiV2.ts";
import { Section } from "../../../../api/generated";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { useCodelistLocalizedLabel, useCodelists } from "../../../../components/codelist.ts";
import { DataCardContext } from "../../../../components/dataCard/dataCardContext.tsx";
import { DataCardSaveAndCancelButtons } from "../../../../components/dataCard/saveAndCancelButtons.tsx";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { useFormDirtyMarkAsChanged } from "../../../../components/form/useFormDirty.tsx";
import { useValidateFormOnMount } from "../../../../components/form/useValidateFormOnMount.tsx";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { useSaveOnCtrlS } from "../../../../hooks/useSaveOnCtrlS";
import { DataCardItemInputProps } from "../completion/completionInterfaces.ts";

// Select fields hold "" while nothing is selected; number fields hold the entered text until submit.
interface SectionFormElement {
  id?: number;
  order?: number;
  fromDepth: number | string | null;
  toDepth: number | string | null;
  drillingMethodId: number | string | null;
  cuttingsId: number | string | null;
  drillingMudTypeId: number | string | null;
  drillingMudSubtypeId: number | string | null;
  drillingStartDate: string | null;
  drillingEndDate: string | null;
  drillingDiameter: number | string | null;
  drillingCoreDiameter: number | string | null;
}

interface SectionFormValues {
  name?: string;
  boreholeId?: number;
  sectionElements: SectionFormElement[];
}

interface DrillingMudTypeOption {
  key: number;
  name: string;
  path: number[];
}

const asSelected = (value: number | string | null) => (typeof value === "number" ? value : null);

const SectionInput: FC<DataCardItemInputProps<Section>> = ({ item, parentId }) => {
  const { triggerReload } = useContext(DataCardContext);
  const { data: codelists } = useCodelists();
  const getLocalizedLabel = useCodelistLocalizedLabel();
  const { t } = useTranslation();
  const resetTabStatus = useResetTabStatus(["sections"]);

  const sectionElementDefaults: SectionFormElement = {
    fromDepth: null,
    toDepth: null,
    drillingMethodId: "",
    cuttingsId: "",
    drillingMudTypeId: "",
    drillingMudSubtypeId: "",
    drillingStartDate: null,
    drillingEndDate: null,
    drillingDiameter: null,
    drillingCoreDiameter: null,
  };

  // prepare the options for the drillingMudType and drillingMudSubtype select fields
  const drillingMudTypeOptions = new Map<number | string | null, DrillingMudTypeOption>(
    codelists
      ?.filter(d => d.schema === "drilling_mud_type")
      ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      ?.map(d => [
        d.id,
        {
          key: d.id,
          name: getLocalizedLabel(d),
          // Path is delivered by the API as an ltree string ("1.2.3"), but the generated TS type
          // represents it as a record.
          path: (d.path as unknown as string | undefined)?.split(".")?.map(id => +id) ?? [],
        },
      ]),
  );

  // initialize react-hook-form
  const formMethods = useForm<SectionFormValues>({
    mode: "all",
    defaultValues: {
      sectionElements: item?.sectionElements || [{ ...sectionElementDefaults }],
    },
  });
  const { reset, formState, getValues, trigger, handleSubmit, control } = formMethods;
  const { fields, append, remove, update } = useFieldArray({
    name: "sectionElements",
    control: control,
    keyName: "sectionElementId", // default "id" clashes with the id property of the sectionElement
    rules: {
      required: true,
    },
  });

  // define methods for data submission
  const prepareFormDataForSubmit = (data: SectionFormValues) => {
    data.sectionElements = data.sectionElements.map((element, i) => {
      element.order = i;
      element.fromDepth = parseFloatWithThousandsSeparator(element.fromDepth);
      element.toDepth = parseFloatWithThousandsSeparator(element.toDepth);
      element.drillingDiameter = parseFloatWithThousandsSeparator(element.drillingDiameter);
      element.drillingCoreDiameter = parseFloatWithThousandsSeparator(element.drillingCoreDiameter);
      return Object.fromEntries(
        Object.entries(element).map(([k, v]) => [k, v === "" ? null : v]),
      ) as unknown as SectionFormElement;
    });
    data.boreholeId = parentId;
    return data;
  };

  const submitForm = (data: SectionFormValues) => {
    resetTabStatus();
    data = prepareFormDataForSubmit(data);
    // The form keeps entered values loosely typed; prepareFormDataForSubmit turns them into the API shape.
    const payload = data as unknown as Section;
    if (item.id === 0) {
      void addSection(payload).then(() => {
        reset();
        triggerReload();
      });
    } else {
      void updateSection({
        ...item,
        ...payload,
      }).then(() => {
        reset();
        triggerReload();
      });
    }
  };

  useSaveOnCtrlS(() => void handleSubmit(submitForm)());
  useValidateFormOnMount({ formMethods });
  useFormDirtyMarkAsChanged({ formState });

  useEffect(() => {
    void trigger("sectionElements");
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues()["sectionElements"]]);

  return (
    <>
      <DevTool control={control} placement="top-left" />
      <FormProvider {...formMethods}>
        <form onSubmit={event => void handleSubmit(submitForm)(event)}>
          <FormContainer>
            <FormInput fieldName="name" label="sectionName" value={item?.name} required={true} />
            {fields
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((field, index) => (
                <FormContainer key={field.sectionElementId || field.id} direction="row">
                  <FormContainer sx={{ flex: "1 0 0", width: 0 }}>
                    <FormContainer direction="row">
                      <FormInput
                        fieldName={`sectionElements.${index}.fromDepth`}
                        label="fromDepth"
                        value={field.fromDepth}
                        type={FormValueType.Number}
                        required={true}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.toDepth`}
                        label="toDepth"
                        value={field.toDepth}
                        type={FormValueType.Number}
                        required={true}
                      />
                    </FormContainer>
                    <FormContainer direction="row">
                      <FormDomainSelect
                        fieldName={`sectionElements.${index}.drillingMethodId`}
                        label="drillingMethod"
                        selected={asSelected(field.drillingMethodId)}
                        schemaName="drilling_method"
                      />
                      <FormDomainSelect
                        fieldName={`sectionElements.${index}.cuttingsId`}
                        label="cuttings"
                        selected={asSelected(field.cuttingsId)}
                        schemaName="borehole_cuttings_core"
                      />
                    </FormContainer>
                    <FormContainer direction="row">
                      <FormSelect
                        fieldName={`sectionElements.${index}.drillingMudTypeId`}
                        label="drillingMudType"
                        selected={asSelected(field.drillingMudTypeId)}
                        values={[...drillingMudTypeOptions.values()].filter(
                          d => d.path.length === 0 || d.path.length === 1,
                        )}
                        onUpdate={newValue => {
                          const subtypeValue = getValues(`sectionElements.${index}.drillingMudSubtypeId`);
                          update(index, {
                            ...getValues(`sectionElements.${index}`),
                            drillingMudTypeId: typeof newValue === "boolean" ? null : newValue,
                            drillingMudSubtypeId:
                              (drillingMudTypeOptions.get(subtypeValue)?.path?.length ?? 0) > 0 ? "" : subtypeValue,
                          });
                        }}
                      />
                      <FormSelect
                        fieldName={`sectionElements.${index}.drillingMudSubtypeId`}
                        label="drillingMudSubtype"
                        selected={asSelected(field.drillingMudSubtypeId)}
                        values={[...drillingMudTypeOptions.values()].filter(
                          d =>
                            d.path.length === 0 ||
                            (d.path.length === 2 &&
                              d.path[0] === getValues(`sectionElements.${index}.drillingMudTypeId`)),
                        )}
                      />
                    </FormContainer>
                    <FormContainer direction="row">
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingStartDate`}
                        label="drillingStartDate"
                        value={field.drillingStartDate}
                        type={FormValueType.Date}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingEndDate`}
                        label="drillingEndDate"
                        value={field.drillingEndDate}
                        type={FormValueType.Date}
                      />
                    </FormContainer>
                    <FormContainer direction="row">
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingDiameter`}
                        label="drillDiameter"
                        value={field.drillingDiameter}
                        type={FormValueType.Number}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingCoreDiameter`}
                        label="drillCoreDiameter"
                        value={field.drillingCoreDiameter}
                        type={FormValueType.Number}
                      />
                    </FormContainer>
                    <FormContainer direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            data-cy={"overcoring-formCheckbox"}
                            checked={index < fields.length - 1}
                            disabled={true}
                          />
                        }
                        label={t("overcoring")}
                      />
                      {index === fields.length - 1 && (
                        <AddButton
                          sx={{ marginRight: "1em !important", height: "3em" }}
                          label="addSectionElement"
                          onClick={() => {
                            append(
                              {
                                ...sectionElementDefaults,
                                fromDepth: getValues(`sectionElements.${fields.length - 1}.fromDepth`),
                                toDepth: getValues(`sectionElements.${fields.length - 1}.toDepth`),
                              },
                              { shouldFocus: false },
                            );
                          }}
                        />
                      )}
                    </FormContainer>
                    {index < fields.length - 1 && <Divider />}
                  </FormContainer>
                  <IconButton
                    onClick={() => remove(index)}
                    data-cy={`sectionElements.${index}.delete`}
                    disabled={fields.length === 1}
                    color="error">
                    <Trash2 />
                  </IconButton>
                </FormContainer>
              ))}
          </FormContainer>
          <DataCardSaveAndCancelButtons formMethods={formMethods} submitForm={submitForm} />
        </form>
      </FormProvider>
    </>
  );
};

export default SectionInput;
