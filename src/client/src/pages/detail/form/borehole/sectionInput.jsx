import { useContext, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Divider, IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { addSection, updateSection, useDomains } from "../../../../api/fetchApiV2.ts";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardContext } from "../../../../components/dataCard/dataCardContext.tsx";
import { DataCardSaveAndCancelButtons } from "../../../../components/dataCard/saveAndCancelButtons.js";
import { FormCheckbox, FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.js";
import { useValidateFormOnMount } from "../../../../components/form/useValidateFormOnMount.js";
import { useBlockNavigation } from "../../../../hooks/useBlockNavigation.tsx";
import { useSaveOnCtrlS } from "../../../../hooks/useSaveOnCtrlS";
import { SaveContext } from "../../saveContext.tsx";

const SectionInput = ({ item, parentId }) => {
  const { triggerReload } = useContext(DataCardContext);
  const { data: domains } = useDomains();
  const { i18n } = useTranslation();
  const { markAsChanged } = useContext(SaveContext);
  useBlockNavigation();

  const sectionElementDefaults = {
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
  const drillingMudTypeOptions = new Map(
    domains
      ?.filter(d => d.schema === "drilling_mud_type")
      ?.sort((a, b) => a.order - b.order)
      ?.map(d => [
        d.id,
        {
          key: d.id,
          name: d[i18n.language],
          path: d.path?.split(".")?.map(id => +id) ?? [],
        },
      ]),
  );

  // initialize react-hook-form
  const formMethods = useForm({
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
  const prepareFormDataForSubmit = data => {
    data.sectionElements = data.sectionElements.map((element, i) => {
      element.order = i;
      element.fromDepth = parseFloatWithThousandsSeparator(element.fromDepth);
      element.toDepth = parseFloatWithThousandsSeparator(element.toDepth);
      element.drillingDiameter = parseFloatWithThousandsSeparator(element.drillingDiameter);
      element.drillingCoreDiameter = parseFloatWithThousandsSeparator(element.drillingCoreDiameter);
      return Object.fromEntries(Object.entries(element).map(([k, v]) => [k, v === "" ? null : v]));
    });
    data.boreholeId = parentId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addSection(data).then(() => {
        reset();
        triggerReload();
      });
    } else {
      updateSection({
        ...item,
        ...data,
      }).then(() => {
        reset();
        triggerReload();
      });
    }
  };

  // Track form dirty state
  useEffect(() => {
    markAsChanged(Object.keys(formState.dirtyFields).length > 0);
    return () => markAsChanged(false);
  }, [formState.dirtyFields, formState.isDirty, markAsChanged]);

  useSaveOnCtrlS(handleSubmit(submitForm));
  useValidateFormOnMount({ formMethods });

  useEffect(() => {
    trigger("sectionElements");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues()["sectionElements"]]);

  return (
    <>
      <DevTool control={control} placement="top-left" />
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(submitForm)}>
          <FormContainer>
            <FormInput fieldName="name" label="section_name" value={item?.name} required={true} />
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field, index) => (
                <FormContainer key={field.sectionElementId || field.id} direction="row">
                  <FormContainer sx={{ flex: "1 0 0", width: 0 }}>
                    <FormContainer direction="row">
                      <FormInput
                        fieldName={`sectionElements.${index}.fromDepth`}
                        label="fromdepth"
                        value={field.fromDepth}
                        withThousandSeparator={true}
                        required={true}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.toDepth`}
                        label="todepth"
                        value={field.toDepth}
                        withThousandSeparator={true}
                        required={true}
                      />
                    </FormContainer>
                    <FormContainer direction="row">
                      <FormDomainSelect
                        fieldName={`sectionElements.${index}.drillingMethodId`}
                        label="drilling_method"
                        selected={field.drillingMethodId}
                        schemaName="extended.drilling_method"
                      />
                      <FormDomainSelect
                        fieldName={`sectionElements.${index}.cuttingsId`}
                        label="cuttings"
                        selected={field.cuttingsId}
                        schemaName="custom.cuttings"
                      />
                    </FormContainer>
                    <FormContainer direction="row">
                      <FormSelect
                        fieldName={`sectionElements.${index}.drillingMudTypeId`}
                        label="drilling_mud_type"
                        selected={field.drillingMudTypeId}
                        values={[...drillingMudTypeOptions.values()].filter(
                          d => d.path.length === 0 || d.path.length === 1,
                        )}
                        onUpdate={newValue => {
                          const subtypeValue = getValues(`sectionElements.${index}.drillingMudSubtypeId`);
                          update(index, {
                            ...getValues(`sectionElements.${index}`),
                            drillingMudTypeId: newValue,
                            drillingMudSubtypeId:
                              drillingMudTypeOptions.get(subtypeValue)?.path?.length > 0 ? "" : subtypeValue,
                          });
                        }}
                      />
                      <FormSelect
                        fieldName={`sectionElements.${index}.drillingMudSubtypeId`}
                        label="drilling_mud_subtype"
                        selected={field.drillingMudSubtypeId}
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
                        label="drilling_start_date"
                        value={field.drillingStartDate}
                        type={FormValueType.Date}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingEndDate`}
                        label="drilling_end_date"
                        value={field.drillingEndDate}
                        type={FormValueType.Date}
                      />
                    </FormContainer>
                    <FormContainer direction="row">
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingDiameter`}
                        label="drill_diameter"
                        value={field.drillingDiameter}
                        withThousandSeparator={true}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingCoreDiameter`}
                        label="drill_core_diameter"
                        value={field.drillingCoreDiameter}
                        withThousandSeparator={true}
                      />
                    </FormContainer>
                    <FormContainer direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                      <FormCheckbox
                        fieldName="overcoring"
                        label="overcoring"
                        checked={index < fields.length - 1}
                        disabled={true}
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
