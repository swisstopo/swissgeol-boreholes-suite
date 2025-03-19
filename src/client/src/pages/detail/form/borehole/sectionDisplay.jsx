import { Divider } from "@mui/material";
import { deleteSection, useDomains } from "../../../../api/fetchApiV2.js";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.tsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";

const SectionDisplay = ({ item }) => {
  const domains = useDomains();

  return (
    <DataDisplayCard item={item} deleteData={deleteSection}>
      <FormDisplay label="section_name" value={item?.name} />

      {item?.sectionElements
        ?.sort((a, b) => a.order - b.order)
        .map((element, index) => (
          <FormContainer key={element.id}>
            <FormContainer direction="row">
              <FormDisplay
                prefix={`${index}.`}
                label="fromdepth"
                value={element.fromDepth}
                type={FormValueType.Number}
              />
              <FormDisplay prefix={`${index}.`} label="todepth" value={element.toDepth} type={FormValueType.Number} />
            </FormContainer>
            <FormContainer direction="row">
              <FormDisplay
                prefix={`${index}.`}
                label="drilling_method"
                value={domains?.data?.find(d => d.id === element.drillingMethodId)}
                type={FormValueType.Domain}
              />
              <FormDisplay
                prefix={`${index}.`}
                label="cuttings"
                value={domains?.data?.find(d => d.id === element.cuttingsId)}
                type={FormValueType.Domain}
              />
            </FormContainer>
            <FormContainer direction="row">
              <FormDisplay
                prefix={`${index}.`}
                label="drilling_mud_type"
                value={domains?.data?.find(d => d.id === element.drillingMudTypeId)}
                type={FormValueType.Domain}
              />
              <FormDisplay
                prefix={`${index}.`}
                label="drilling_mud_subtype"
                value={domains?.data?.find(d => d.id === element.drillingMudSubtypeId)}
                type={FormValueType.Domain}
              />
            </FormContainer>
            <FormContainer direction="row">
              <FormDisplay
                prefix={`${index}.`}
                label="drilling_start_date"
                value={element.drillingStartDate}
                type={FormValueType.Date}
              />
              <FormDisplay
                prefix={`${index}.`}
                label="drilling_end_date"
                value={element.drillingEndDate}
                type={FormValueType.Date}
              />
            </FormContainer>
            <FormContainer direction="row">
              <FormDisplay
                prefix={`${index}.`}
                label="drill_diameter"
                value={element.drillingDiameter}
                type={FormValueType.Number}
              />
              <FormDisplay
                prefix={`${index}.`}
                label="drill_core_diameter"
                value={element.drillingCoreDiameter}
                type={FormValueType.Number}
              />
            </FormContainer>
            <FormDisplay
              prefix={`${index}.`}
              label="overcoring"
              value={index < item.sectionElements.length - 1}
              type={FormValueType.Boolean}
            />
            {index < item.sectionElements.length - 1 && <Divider />}
          </FormContainer>
        ))}
    </DataDisplayCard>
  );
};

export default SectionDisplay;
