import {
  evaluateCheckbox,
  evaluateInput,
  evaluateMultiSelect,
  evaluateSelect,
  evaluateTextarea,
  formatWithThousandsSeparator,
  isDisabled,
  setInput,
  setSelect,
  toggleCheckbox,
  toggleMultiSelect,
} from "../helpers/formHelpers";
import { handlePrompt } from "../helpers/testHelpers";

interface LithologyFormValues {
  fromDepth?: number;
  toDepth?: number;
  hasBedding?: boolean;
  share?: number;
  notes?: string;
}

interface UnconsolidatedLithologyDescriptionValues {
  lithologyUnconMainId?: number | string;
  lithologyUncon2Id?: number | string;
  lithologyUncon3Id?: number | string;
  lithologyUncon4Id?: number | string;
  lithologyUncon5Id?: number | string;
  lithologyUncon6Id?: number | string;
  componentUnconOrganicCodelistIds?: Array<number | string>;
  componentUnconDebrisCodelistIds?: Array<number | string>;
  colorPrimaryId?: number | string;
  colorSecondaryId?: number | string;
  grainShapeCodelistIds?: Array<number | string>;
  grainAngularityCodelistIds?: Array<number | string>;
  lithologyUnconDebrisCodelistIds?: Array<number | string>;
  hasStriae?: boolean;
}

interface UnconsolidatedLithologyFormValues extends LithologyFormValues {
  lithologyDescriptions?: UnconsolidatedLithologyDescriptionValues[];
  compactnessId?: number | string;
  cohesionId?: number | string;
  humidityId?: number | string;
  consistencyId?: number | string;
  plasticityId?: number | string;
  uscsTypeCodelistIds?: Array<number | string>;
  uscsDeterminationId?: number | string;
  rockConditionCodelistIds?: Array<number | string>;
  alterationDegreeId?: number | string;
}

interface ConsolidatedLithologyDescriptionValues {
  lithologyConId?: number | string;
  colorPrimaryId?: number | string;
  colorSecondaryId?: number | string;
  componentConParticleCodelistIds?: Array<number | string>;
  componentConMineralCodelistIds?: Array<number | string>;
  grainSizeId?: number | string;
  grainAngularityId?: number | string;
  gradationId?: number | string;
  cementationId?: number | string;
  structureSynGenCodelistIds?: Array<number | string>;
  structurePostGenCodelistIds?: Array<number | string>;
}

interface ConsolidatedLithologyFormValues extends LithologyFormValues {
  lithologyDescriptions?: ConsolidatedLithologyDescriptionValues[];
  textureMetaCodelistIds?: Array<number | string>;
  alterationDegreeId?: number | string;
}

interface LithologicalDescriptionFormValues {
  fromDepth?: number;
  toDepth?: number;
  fromDepthOptionsLength?: number;
  toDepthOptionsLength?: number;
  description?: string;
}

interface FaciesDescriptionFormValues extends LithologicalDescriptionFormValues {
  faciesId?: number | string;
}

export const checkHasBedding = (hasBedding: boolean, share?: number) => {
  if (hasBedding) {
    evaluateCheckbox("hasBedding", true);
    cy.dataCy("lithologyDescriptions.1").should("exist");
    isDisabled("shareInverse");

    if (share) {
      evaluateInput("share", share);
      evaluateInput("shareInverse", 100 - share);
    }
  } else {
    evaluateCheckbox("hasBedding", false);
    evaluateInput("share", "");
    isDisabled("share");
    cy.dataCy("lithologyDescriptions.1").should("not.exist");
  }
};

export const RockType = {
  unconsolidated: "Unconsolidated rock",
  consolidated: "Consolidated rock",
};

export const isUnconsolidatedForm = (isUnconsolidated: boolean) => {
  if (isUnconsolidated) {
    cy.contains("button", RockType.unconsolidated).should("have.class", "Mui-selected");
    cy.contains("button", RockType.consolidated).should("not.have.class", "Mui-selected");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("exist");
    cy.dataCy("lithologyDescriptions.0.lithologyConId-formSelect").should("not.exist");
  } else {
    cy.contains("button", RockType.unconsolidated).should("not.have.class", "Mui-selected");
    cy.contains("button", RockType.consolidated).should("have.class", "Mui-selected");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("not.exist");
    cy.dataCy("lithologyDescriptions.0.lithologyConId-formSelect").should("exist");
  }
};

export const switchRockType = (newRockType: string, action: string) => {
  const isUnconsolidated = newRockType === RockType.unconsolidated;
  const otherRockType = isUnconsolidated ? RockType.consolidated : RockType.unconsolidated;
  cy.contains("button", newRockType).click();
  handlePrompt(
    `When switching from ${otherRockType.toLowerCase()} to ${newRockType.toLowerCase()} existing values in the form will be lost. Would you like to continue?`,
    action,
  );
  isUnconsolidatedForm((action === "Continue" && isUnconsolidated) || (action !== "Continue" && !isUnconsolidated));
};

const fillUnconsoldiateLithologyDescriptionForm = (values: UnconsolidatedLithologyDescriptionValues, index: number) => {
  if (values.lithologyUnconMainId !== undefined)
    setSelect(`lithologyDescriptions.${index}.lithologyUnconMainId`, values.lithologyUnconMainId as number);
  if (values.lithologyUncon2Id !== undefined)
    setSelect(`lithologyDescriptions.${index}.lithologyUncon2Id`, values.lithologyUncon2Id as number);
  if (values.lithologyUncon3Id !== undefined)
    setSelect(`lithologyDescriptions.${index}.lithologyUncon3Id`, values.lithologyUncon3Id as number);
  if (values.lithologyUncon4Id !== undefined)
    setSelect(`lithologyDescriptions.${index}.lithologyUncon4Id`, values.lithologyUncon4Id as number);
  if (values.lithologyUncon5Id !== undefined)
    setSelect(`lithologyDescriptions.${index}.lithologyUncon5Id`, values.lithologyUncon5Id as number);
  if (values.lithologyUncon6Id !== undefined)
    setSelect(`lithologyDescriptions.${index}.lithologyUncon6Id`, values.lithologyUncon6Id as number);
  if (values.componentUnconOrganicCodelistIds !== undefined)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.componentUnconOrganicCodelistIds`,
      values.componentUnconOrganicCodelistIds as number[],
    );
  if (values.componentUnconDebrisCodelistIds !== undefined)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.componentUnconDebrisCodelistIds`,
      values.componentUnconDebrisCodelistIds as number[],
    );
  if (values.colorPrimaryId !== undefined)
    setSelect(`lithologyDescriptions.${index}.colorPrimaryId`, values.colorPrimaryId as number);
  if (values.colorSecondaryId !== undefined)
    setSelect(`lithologyDescriptions.${index}.colorSecondaryId`, values.colorSecondaryId as number);
  if (values.grainShapeCodelistIds !== undefined)
    toggleMultiSelect(`lithologyDescriptions.${index}.grainShapeCodelistIds`, values.grainShapeCodelistIds as number[]);
  if (values.grainAngularityCodelistIds !== undefined)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.grainAngularityCodelistIds`,
      values.grainAngularityCodelistIds as number[],
    );
  if (values.lithologyUnconDebrisCodelistIds !== undefined)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.lithologyUnconDebrisCodelistIds`,
      values.lithologyUnconDebrisCodelistIds as number[],
    );
  if (values.hasStriae) toggleCheckbox(`lithologyDescriptions.${index}.hasStriae`);
};

export const fillUnconsolidatedLithologyForm = (values: UnconsolidatedLithologyFormValues) => {
  if (values.fromDepth !== undefined) setInput("fromDepth", values.fromDepth);
  if (values.toDepth !== undefined) setInput("toDepth", values.toDepth);
  if (values.hasBedding !== undefined) {
    toggleCheckbox("hasBedding");
    if (values.share !== undefined) {
      setInput("share", values.share);
    }
  }
  if (values.lithologyDescriptions) {
    values.lithologyDescriptions.forEach((desc, i) => fillUnconsoldiateLithologyDescriptionForm(desc, i));
  }
  if (values.compactnessId !== undefined) setSelect("compactnessId", values.compactnessId as number);
  if (values.cohesionId !== undefined) setSelect("cohesionId", values.cohesionId as number);
  if (values.humidityId !== undefined) setSelect("humidityId", values.humidityId as number);
  if (values.consistencyId !== undefined) setSelect("consistencyId", values.consistencyId as number);
  if (values.plasticityId !== undefined) setSelect("plasticityId", values.plasticityId as number);
  if (values.uscsTypeCodelistIds) toggleMultiSelect("uscsTypeCodelistIds", values.uscsTypeCodelistIds as number[]);
  if (values.uscsDeterminationId !== undefined) setSelect("uscsDeterminationId", values.uscsDeterminationId as number);
  if (values.rockConditionCodelistIds)
    toggleMultiSelect("rockConditionCodelistIds", values.rockConditionCodelistIds as number[]);
  if (values.alterationDegreeId !== undefined) setSelect("alterationDegreeId", values.alterationDegreeId as number);
  if (values.notes !== undefined) setInput("description", values.notes);
};

const evaluateUnconsoldiateLithologyDescriptionForm = (
  values: UnconsolidatedLithologyDescriptionValues,
  index: number,
) => {
  if (values.lithologyUnconMainId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.lithologyUnconMainId`, values.lithologyUnconMainId as string);
  if (values.lithologyUncon2Id !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.lithologyUncon2Id`, values.lithologyUncon2Id as string);
  if (values.lithologyUncon3Id !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.lithologyUncon3Id`, values.lithologyUncon3Id as string);
  if (values.lithologyUncon4Id !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.lithologyUncon4Id`, values.lithologyUncon4Id as string);
  if (values.lithologyUncon5Id !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.lithologyUncon5Id`, values.lithologyUncon5Id as string);
  if (values.lithologyUncon6Id !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.lithologyUncon6Id`, values.lithologyUncon6Id as string);
  if (values.componentUnconOrganicCodelistIds !== undefined)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.componentUnconOrganicCodelistIds`,
      values.componentUnconOrganicCodelistIds as string[],
    );
  if (values.componentUnconDebrisCodelistIds !== undefined)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.componentUnconDebrisCodelistIds`,
      values.componentUnconDebrisCodelistIds as string[],
    );
  if (values.colorPrimaryId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.colorPrimaryId`, values.colorPrimaryId as string);
  if (values.colorSecondaryId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.colorSecondaryId`, values.colorSecondaryId as string);
  if (values.grainShapeCodelistIds !== undefined)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.grainShapeCodelistIds`,
      values.grainShapeCodelistIds as string[],
    );
  if (values.grainAngularityCodelistIds !== undefined)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.grainAngularityCodelistIds`,
      values.grainAngularityCodelistIds as string[],
    );
  if (values.lithologyUnconDebrisCodelistIds !== undefined)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.lithologyUnconDebrisCodelistIds`,
      values.lithologyUnconDebrisCodelistIds as string[],
    );
  if (values.hasStriae !== undefined)
    evaluateCheckbox(`lithologyDescriptions.${index}.hasStriae`, values.hasStriae as boolean);
};

export const evaluateUnconsolidatedLithologyForm = (values: UnconsolidatedLithologyFormValues) => {
  if (values.fromDepth !== undefined) evaluateInput("fromDepth", values.fromDepth);
  if (values.toDepth !== undefined) evaluateInput("toDepth", values.toDepth);
  checkHasBedding(!!values.hasBedding, values.share);
  if (values.lithologyDescriptions) {
    values.lithologyDescriptions.forEach((desc, i) => evaluateUnconsoldiateLithologyDescriptionForm(desc, i));
  }
  if (values.compactnessId !== undefined) evaluateSelect("compactnessId", values.compactnessId as string);
  if (values.cohesionId !== undefined) evaluateSelect("cohesionId", values.cohesionId as string);
  if (values.humidityId !== undefined) evaluateSelect("humidityId", values.humidityId as string);
  if (values.consistencyId !== undefined) evaluateSelect("consistencyId", values.consistencyId as string);
  if (values.plasticityId !== undefined) evaluateSelect("plasticityId", values.plasticityId as string);
  if (values.uscsTypeCodelistIds) evaluateMultiSelect("uscsTypeCodelistIds", values.uscsTypeCodelistIds as string[]);
  if (values.uscsDeterminationId !== undefined)
    evaluateSelect("uscsDeterminationId", values.uscsDeterminationId as string);
  if (values.rockConditionCodelistIds)
    evaluateMultiSelect("rockConditionCodelistIds", values.rockConditionCodelistIds as string[]);
  if (values.alterationDegreeId !== undefined)
    evaluateSelect("alterationDegreeId", values.alterationDegreeId as string);
  if (values.notes !== undefined) evaluateTextarea("description", values.notes);
};

const fillConsoldiateLithologyDescriptionForm = (values: ConsolidatedLithologyDescriptionValues, index: number) => {
  if (values.lithologyConId !== undefined)
    setSelect(`lithologyDescriptions.${index}.lithologyConId`, values.lithologyConId as number);
  if (values.colorPrimaryId !== undefined)
    setSelect(`lithologyDescriptions.${index}.colorPrimaryId`, values.colorPrimaryId as number);
  if (values.colorSecondaryId !== undefined)
    setSelect(`lithologyDescriptions.${index}.colorSecondaryId`, values.colorSecondaryId as number);
  if (values.componentConParticleCodelistIds)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.componentConParticleCodelistIds`,
      values.componentConParticleCodelistIds as number[],
    );
  if (values.componentConMineralCodelistIds)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.componentConMineralCodelistIds`,
      values.componentConMineralCodelistIds as number[],
    );
  if (values.grainSizeId !== undefined)
    setSelect(`lithologyDescriptions.${index}.grainSizeId`, values.grainSizeId as number);
  if (values.grainAngularityId !== undefined)
    setSelect(`lithologyDescriptions.${index}.grainAngularityId`, values.grainAngularityId as number);
  if (values.gradationId !== undefined)
    setSelect(`lithologyDescriptions.${index}.gradationId`, values.gradationId as number);
  if (values.cementationId !== undefined)
    setSelect(`lithologyDescriptions.${index}.cementationId`, values.cementationId as number);
  if (values.structureSynGenCodelistIds)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.structureSynGenCodelistIds`,
      values.structureSynGenCodelistIds as number[],
    );
  if (values.structurePostGenCodelistIds)
    toggleMultiSelect(
      `lithologyDescriptions.${index}.structurePostGenCodelistIds`,
      values.structurePostGenCodelistIds as number[],
    );
};

export const fillConsolidatedLithologyForm = (values: ConsolidatedLithologyFormValues) => {
  if (values.fromDepth !== undefined) setInput("fromDepth", values.fromDepth);
  if (values.toDepth !== undefined) setInput("toDepth", values.toDepth);
  if (values.hasBedding) {
    toggleCheckbox("hasBedding");
    if (values.share !== undefined) {
      setInput("share", values.share);
    }
  }
  if (values.lithologyDescriptions) {
    values.lithologyDescriptions.forEach((desc, i) => fillConsoldiateLithologyDescriptionForm(desc, i));
  }
  if (values.textureMetaCodelistIds !== undefined)
    toggleMultiSelect("textureMetaCodelistIds", values.textureMetaCodelistIds as number[]);
  if (values.alterationDegreeId !== undefined) setSelect("alterationDegreeId", values.alterationDegreeId as number);
  if (values.notes !== undefined) setInput("description", values.notes);
};

const evaluateConsoldiateLithologyDescriptionForm = (values: ConsolidatedLithologyDescriptionValues, index: number) => {
  if (values.lithologyConId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.lithologyConId`, values.lithologyConId as string);
  if (values.colorPrimaryId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.colorPrimaryId`, values.colorPrimaryId as string);
  if (values.colorSecondaryId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.colorSecondaryId`, values.colorSecondaryId as string);
  if (values.componentConParticleCodelistIds)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.componentConParticleCodelistIds`,
      values.componentConParticleCodelistIds as string[],
    );
  if (values.componentConMineralCodelistIds)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.componentConMineralCodelistIds`,
      values.componentConMineralCodelistIds as string[],
    );
  if (values.grainSizeId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.grainSizeId`, values.grainSizeId as string);
  if (values.grainAngularityId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.grainAngularityId`, values.grainAngularityId as string);
  if (values.gradationId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.gradationId`, values.gradationId as string);
  if (values.cementationId !== undefined)
    evaluateSelect(`lithologyDescriptions.${index}.cementationId`, values.cementationId as string);
  if (values.structureSynGenCodelistIds)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.structureSynGenCodelistIds`,
      values.structureSynGenCodelistIds as string[],
    );
  if (values.structurePostGenCodelistIds)
    evaluateMultiSelect(
      `lithologyDescriptions.${index}.structurePostGenCodelistIds`,
      values.structurePostGenCodelistIds as string[],
    );
};

export const evaluateConsolidatedLithologyForm = (values: ConsolidatedLithologyFormValues) => {
  if (values.fromDepth !== undefined) evaluateInput("fromDepth", values.fromDepth);
  if (values.toDepth !== undefined) evaluateInput("toDepth", values.toDepth);
  checkHasBedding(!!values.hasBedding, values.share);
  if (values.lithologyDescriptions) {
    values.lithologyDescriptions.forEach((desc, i) => evaluateConsoldiateLithologyDescriptionForm(desc, i));
  }
  if (values.textureMetaCodelistIds !== undefined)
    evaluateMultiSelect("textureMetaCodelistIds", values.textureMetaCodelistIds as string[]);
  if (values.alterationDegreeId !== undefined)
    evaluateSelect("alterationDegreeId", values.alterationDegreeId as string);

  if (values.notes !== undefined) evaluateTextarea("description", values.notes);
};

export const fillLithologicalDescriptionForm = (values: LithologicalDescriptionFormValues) => {
  if (values.fromDepth !== undefined) setSelect("fromDepth", values.fromDepth, values.fromDepthOptionsLength);
  if (values.toDepth !== undefined) setSelect("toDepth", values.toDepth, values.toDepthOptionsLength);
  if (values.description !== undefined) setInput("description", values.description);
};

export const evaluateLithologicalDescriptionForm = (values: LithologicalDescriptionFormValues) => {
  if (values.fromDepth !== undefined) evaluateSelect("fromDepth", formatWithThousandsSeparator(values.fromDepth));
  if (values.toDepth !== undefined) evaluateSelect("toDepth", formatWithThousandsSeparator(values.toDepth));
  if (values.description !== undefined) evaluateTextarea("description", values.description);
};

export const fillFaciesDescriptionForm = (values: FaciesDescriptionFormValues) => {
  if (values.fromDepth !== undefined) setSelect("fromDepth", values.fromDepth, values.fromDepthOptionsLength);
  if (values.toDepth !== undefined) setSelect("toDepth", values.toDepth, values.toDepthOptionsLength);
  if (values.faciesId !== undefined) setSelect("faciesId", values.faciesId as number);
  if (values.description !== undefined) setInput("description", values.description);
};

export const evaluateFaciesDescriptionForm = (values: FaciesDescriptionFormValues) => {
  if (values.fromDepth !== undefined) evaluateSelect("fromDepth", formatWithThousandsSeparator(values.fromDepth));
  if (values.toDepth !== undefined) evaluateSelect("toDepth", formatWithThousandsSeparator(values.toDepth));
  if (values.faciesId !== undefined) evaluateSelect("faciesId", values.faciesId);
  if (values.description !== undefined) evaluateTextarea("description", values.description);
};
