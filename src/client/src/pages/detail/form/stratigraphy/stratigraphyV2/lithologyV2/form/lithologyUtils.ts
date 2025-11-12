import { FormErrors } from "../../../../../../../components/form/form.ts";
import {
  buildErrorStructure,
  parseFloatWithThousandsSeparator,
} from "../../../../../../../components/form/formUtils.ts";
import { Lithology, LithologyDescription } from "../../../lithology.ts";

export const prepareLithologyForSubmit = (values: Lithology) => {
  values.fromDepth = parseFloatWithThousandsSeparator(values.fromDepth)!;
  values.toDepth = parseFloatWithThousandsSeparator(values.toDepth)!;

  delete values.shareInverse;
  delete values.alterationDegree;
  delete values.compactness;
  delete values.cohesion;
  delete values.humidity;
  delete values.consistency;
  delete values.plasticity;
  delete values.uscsDetermination;
  delete values.uscsTypeCodelists;
  delete values.rockConditionCodelists;
  delete values.textureMetaCodelists;
  delete values.createdBy;
  delete values.updatedBy;
  delete values.stratigraphy;
  if (String(values.alterationDegreeId) === "") values.alterationDegreeId = null;
  if (String(values.compactnessId) === "") values.compactnessId = null;
  if (String(values.cohesionId) === "") values.cohesionId = null;
  if (String(values.humidityId) === "") values.humidityId = null;
  if (String(values.consistencyId) === "") values.consistencyId = null;
  if (String(values.plasticityId) === "") values.plasticityId = null;
  if (String(values.uscsDeterminationId) === "") values.uscsDeterminationId = null;

  if (values?.lithologyDescriptions) {
    for (const description of values.lithologyDescriptions) {
      delete description.colorPrimary;
      delete description.colorSecondary;
      delete description.lithologyUnconMain;
      delete description.lithologyUncon2;
      delete description.lithologyUncon3;
      delete description.lithologyUncon4;
      delete description.lithologyUncon5;
      delete description.lithologyUncon6;
      delete description.componentUnconOrganicCodelists;
      delete description.componentUnconDebrisCodelists;
      delete description.grainShapeCodelists;
      delete description.grainAngularityCodelists;
      delete description.lithologyUnconDebrisCodelists;
      delete description.lithologyCon;
      delete description.componentConParticleCodelists;
      delete description.componentConMineralCodelists;
      delete description.grainSize;
      delete description.grainAngularity;
      delete description.gradation;
      delete description.cementation;
      delete description.structureSynGenCodelists;
      delete description.structurePostGenCodelists;

      if (String(description.colorPrimaryId) === "") description.colorPrimaryId = null;
      if (String(description.colorSecondaryId) === "") description.colorSecondaryId = null;
      if (String(description.lithologyUnconMainId) === "") description.lithologyUnconMainId = null;
      if (String(description.lithologyUncon2Id) === "") description.lithologyUncon2Id = null;
      if (String(description.lithologyUncon3Id) === "") description.lithologyUncon3Id = null;
      if (String(description.lithologyUncon4Id) === "") description.lithologyUncon4Id = null;
      if (String(description.lithologyUncon5Id) === "") description.lithologyUncon5Id = null;
      if (String(description.lithologyUncon6Id) === "") description.lithologyUncon6Id = null;
      if (String(description.lithologyConId) === "") description.lithologyConId = null;
      if (String(description.grainSizeId) === "") description.grainSizeId = null;
      if (String(description.grainAngularityId) === "") description.grainAngularityId = null;
      if (String(description.gradationId) === "") description.gradationId = null;
      if (String(description.cementationId) === "") description.cementationId = null;
    }
  }
};

export const validateLithologyUnconValues = (descriptions: LithologyDescription[] | undefined, errors: FormErrors) => {
  if (!descriptions || descriptions.length === 0) return;

  const index = descriptions?.[0].isFirst ? 0 : 1;
  const fields = [
    "lithologyUnconMainId",
    "lithologyUncon2Id",
    "lithologyUncon3Id",
    "lithologyUncon4Id",
    "lithologyUncon5Id",
    "lithologyUncon6Id",
  ];
  const flatErrors: Record<string, string> = {};

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const value = descriptions?.[index]?.[field as keyof LithologyDescription] as number;
    if (value && i > 0) {
      for (let j = 0; j < i; j++) {
        const prevValue = descriptions?.[index]?.[fields[j] as keyof LithologyDescription] as number;
        if (!prevValue) {
          flatErrors[`lithologyDescriptions.${index}.${fields[j]}`] = "lithologyUnconPreviousRequired";
        }
      }
    }
  }

  if (Object.keys(flatErrors).length > 0) {
    buildErrorStructure(flatErrors, errors);
  }
};
