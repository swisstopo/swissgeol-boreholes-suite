import { useTranslation } from "react-i18next";
import { Divider, IconButton } from "@mui/material";
import { StackFullWidth } from "../../../../components/styledComponents.ts";
import { FormCheckbox, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { addSection, updateSection, useDomains } from "../../../../api/fetchApiV2.js";
import { useContext, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard.jsx";
import { AddButton, CancelButton, SaveButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardContext } from "../../../../components/dataCard/dataCardContext.jsx";
import Delete from "@mui/icons-material/Delete";
import { DevTool } from "../../../../../hookformDevtools.ts";

const SectionInput = ({ item, parentId }) => {
  const { triggerReload, selectCard } = useContext(DataCardContext);
  const { data: domains } = useDomains();
  const { i18n } = useTranslation();

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
  const { fields, append, remove, update } = useFieldArray({
    name: "sectionElements",
    control: formMethods.control,
    keyName: "sectionElementId", // default "id" clashes with the id property of the sectionElement
    rules: {
      required: true,
    },
  });

  // define methods for data submission
  const prepareFormDataForSubmit = data => {
    data.sectionElements = data.sectionElements.map((element, i) => {
      element.order = i;
      return Object.fromEntries(Object.entries(element).map(([k, v]) => [k, v === "" ? null : v]));
    });
    data.boreholeId = parentId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addSection(data).then(() => {
        triggerReload();
      });
    } else {
      updateSection({
        ...item,
        ...data,
      }).then(() => {
        triggerReload();
      });
    }
  };

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  useEffect(() => {
    formMethods.trigger("sectionElements");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.getValues()["sectionElements"]]);

  return (
    <>
      <DevTool control={formMethods.control} placement="top-left" />
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <StackFullWidth direction="column" spacing={1}>
            <FormInput fieldName="name" label="section_name" value={item?.name} required={true} />
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field, index) => (
                <StackFullWidth key={field.sectionElementId || field.id} direction="row" spacing={1}>
                  <StackFullWidth direction="column" spacing={1} sx={{ flex: "1 0 0", width: 0 }}>
                    <StackFullWidth direction="row" spacing={1}>
                      <FormInput
                        fieldName={`sectionElements.${index}.fromDepth`}
                        label="fromdepth"
                        value={field.fromDepth}
                        type={FormValueType.Number}
                        required={true}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.toDepth`}
                        label="todepth"
                        value={field.toDepth}
                        type={FormValueType.Number}
                        required={true}
                      />
                    </StackFullWidth>
                    <StackFullWidth direction="row" spacing={1}>
                      <FormSelect
                        fieldName={`sectionElements.${index}.drillingMethodId`}
                        label="drilling_method"
                        selected={field.drillingMethodId}
                        values={domains
                          ?.filter(d => d.schema === "extended.drilling_method")
                          .sort((a, b) => a.order - b.order)
                          .map(d => ({ key: d.id, name: d[i18n.language] }))}
                      />
                      <FormSelect
                        fieldName={`sectionElements.${index}.cuttingsId`}
                        label="cuttings"
                        selected={field.cuttingsId}
                        values={domains
                          ?.filter(d => d.schema === "custom.cuttings")
                          .sort((a, b) => a.order - b.order)
                          .map(d => ({ key: d.id, name: d[i18n.language] }))}
                      />
                    </StackFullWidth>
                    <StackFullWidth direction="row" spacing={1}>
                      <FormSelect
                        fieldName={`sectionElements.${index}.drillingMudTypeId`}
                        label="drilling_mud_type"
                        selected={field.drillingMudTypeId}
                        values={[...drillingMudTypeOptions.values()].filter(
                          d => d.path.length === 0 || d.path.length === 1,
                        )}
                        onUpdate={newValue => {
                          const subtypeValue = formMethods.getValues(`sectionElements.${index}.drillingMudSubtypeId`);
                          update(index, {
                            ...formMethods.getValues(`sectionElements.${index}`),
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
                              d.path[0] === formMethods.getValues(`sectionElements.${index}.drillingMudTypeId`)),
                        )}
                      />
                    </StackFullWidth>
                    <StackFullWidth direction="row" spacing={1}>
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
                    </StackFullWidth>
                    <StackFullWidth direction="row" spacing={1}>
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingDiameter`}
                        label="drill_diameter"
                        value={field.drillingDiameter}
                        type={FormValueType.Number}
                      />
                      <FormInput
                        fieldName={`sectionElements.${index}.drillingCoreDiameter`}
                        label="drill_core_diameter"
                        value={field.drillingCoreDiameter}
                        type={FormValueType.Number}
                      />
                    </StackFullWidth>
                    <StackFullWidth
                      direction={"row"}
                      spacing={1}
                      justifyContent={"space-between"}
                      alignItems={"center"}>
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
                                fromDepth: formMethods.getValues(`sectionElements.${fields.length - 1}.fromDepth`),
                                toDepth: formMethods.getValues(`sectionElements.${fields.length - 1}.toDepth`),
                              },
                              { shouldFocus: false },
                            );
                          }}
                        />
                      )}
                    </StackFullWidth>
                    {index < fields.length - 1 && <Divider />}
                  </StackFullWidth>
                  <IconButton
                    onClick={() => remove(index)}
                    data-cy={`sectionElements.${index}.delete`}
                    disabled={fields.length === 1}
                    color="error">
                    <Delete />
                  </IconButton>
                </StackFullWidth>
              ))}
          </StackFullWidth>

          <DataCardButtonContainer>
            <CancelButton
              onClick={() => {
                formMethods.reset();
                selectCard(null);
              }}
            />
            <SaveButton
              disabled={!formMethods.formState.isValid}
              onClick={() => {
                formMethods.handleSubmit(submitForm)();
              }}
            />
          </DataCardButtonContainer>
        </form>
      </FormProvider>
    </>
  );
};

export default SectionInput;
