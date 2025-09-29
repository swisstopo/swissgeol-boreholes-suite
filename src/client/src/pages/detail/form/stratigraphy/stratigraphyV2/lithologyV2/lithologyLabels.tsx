import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import type { TFunction } from "i18next";
import { useCodelistDisplayValues } from "../../../../../../components/codelist.ts";
import { Lithology, LithologyDescription } from "../../lithology";

const uselessStrings = new Set(["keine Angabe", "sans indication", "senza indicazioni", "not specified"]);

const getBeddingShare = (lithology: Lithology, index: number) => {
  let beddingShare: number | undefined;
  if (lithology.hasBedding && lithology.share) {
    beddingShare = index === 0 ? lithology.share : 100 - lithology.share;
  }
  return beddingShare;
};

// Todo: should all these helper function be custom hooks so that translations and getCodelist can be used directly?
const buildUnconsolidatedPrimaryString = (
  t: TFunction,
  description: LithologyDescription,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
  share?: number,
) => {
  const codes: string[] = [];
  let primaryValues: string[] = [];

  const pushCodeAndValue = (id: number | null | undefined) => {
    if (!id) return;
    const { text, code } = getCodelistDisplayValues(id);
    codes.push(code);
    primaryValues.push(text);
  };

  const pushCodelistValues = (list?: number[]) => {
    if (list && list.length > 0) {
      primaryValues.push(...list.map(id => getCodelistDisplayValues(id).text));
    }
  };

  pushCodeAndValue(description.lithologyUnconMainId);
  pushCodeAndValue(description.lithologyUncon2Id);
  pushCodeAndValue(description.lithologyUncon3Id);
  pushCodeAndValue(description.lithologyUncon4Id);
  pushCodeAndValue(description.lithologyUncon5Id);
  pushCodeAndValue(description.lithologyUncon6Id);

  pushCodelistValues(description.componentUnconOrganicCodelistIds);
  pushCodelistValues(description.componentUnconDebrisCodelistIds);

  if (description.colorPrimaryId) {
    primaryValues.push(getCodelistDisplayValues(description.colorPrimaryId).text);
  }
  if (description.colorSecondaryId) {
    primaryValues.push(getCodelistDisplayValues(description.colorSecondaryId).text);
  }

  primaryValues = primaryValues.filter(v => !uselessStrings.has(v));

  const lithologyEnCode = codes.join("-");
  let primaryString = "";
  if (share) {
    primaryString += `${share}%`;
  }
  if (codes.length > 0) {
    if (primaryString.length > 0) primaryString += " ";
    primaryString += `[${lithologyEnCode}]`;
  }
  if (primaryValues.length > 0) {
    primaryString += `: ${primaryValues.join(", ")}`;
  }
  return primaryString;
};

const buildUnconsolidatedSecondaryString = (
  t: TFunction,
  description: LithologyDescription,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
) => {
  let secondaryValues: string[] = [];
  if (description.lithologyUnconDebrisCodelistIds && description.lithologyUnconDebrisCodelistIds.length > 0) {
    secondaryValues.push(...description.lithologyUnconDebrisCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (description.grainShapeCodelistIds && description.grainShapeCodelistIds.length > 0) {
    secondaryValues.push(...description.grainShapeCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (description.grainAngularityCodelistIds && description.grainAngularityCodelistIds.length > 0) {
    secondaryValues.push(...description.grainAngularityCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (description.hasStriae) {
    secondaryValues.push(t("striae"));
  }

  secondaryValues = secondaryValues.filter(v => !uselessStrings.has(v));
  if (secondaryValues.length === 0) return "";
  return `${t("coarseComponent", { count: secondaryValues.length })}: ${secondaryValues.join(", ")}`;
};

const buildUnconsolidatedDetails1String = (
  t: TFunction,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
  lithology: Lithology,
) => {
  const details: string[] = [];
  if (lithology.compactnessId) details.push(getCodelistDisplayValues(lithology.compactnessId).text);
  if (lithology.consistencyId) details.push(getCodelistDisplayValues(lithology.consistencyId).text);
  if (lithology.cohesionId) details.push(getCodelistDisplayValues(lithology.cohesionId).text);
  if (lithology.plasticityId) details.push(getCodelistDisplayValues(lithology.plasticityId).text);
  if (lithology.humidityId) details.push(getCodelistDisplayValues(lithology.humidityId).text);

  if (lithology.uscsTypeCodelistIds && lithology.uscsTypeCodelistIds.length > 0) {
    let uscsString = `${t("uscsClass", { count: lithology.uscsTypeCodelistIds.length })}: ${lithology.uscsTypeCodelistIds
      .map(id => getCodelistDisplayValues(id).text)
      .filter(s => !uselessStrings.has(s))
      .join(", ")}`;
    if (
      lithology.uscsDeterminationId &&
      !uselessStrings.has(getCodelistDisplayValues(lithology.uscsDeterminationId).text)
    ) {
      uscsString += ` (${getCodelistDisplayValues(lithology.uscsDeterminationId).text})`;
    }
    details.push(uscsString);
  }

  return details.filter(d => !uselessStrings.has(d)).join(", ");
};

const buildUnconsolidatedDetails2String = (
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
  lithology: Lithology,
) => {
  const details: string[] = [];
  if (lithology.rockConditionCodelistIds && lithology.rockConditionCodelistIds.length > 0) {
    details.push(...lithology.rockConditionCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (lithology.alterationDegreeId) details.push(getCodelistDisplayValues(lithology.alterationDegreeId).text);

  return details.filter(d => !uselessStrings.has(d)).join(", ");
};

const buildConsolidatedPrimaryString = (
  t: TFunction,
  description: LithologyDescription,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
  share?: number,
) => {
  let primaryValues = [];
  if (description.lithologyConId) {
    primaryValues.push(getCodelistDisplayValues(description.lithologyConId).text);
  }
  if (description.componentConParticleCodelistIds && description.componentConParticleCodelistIds.length > 0) {
    primaryValues.push(...description.componentConParticleCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (description.componentConMineralCodelistIds && description.componentConMineralCodelistIds.length > 0) {
    primaryValues.push(...description.componentConMineralCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (description.colorPrimaryId) {
    primaryValues.push(getCodelistDisplayValues(description.colorPrimaryId).text);
  }
  if (description.colorSecondaryId) {
    primaryValues.push(getCodelistDisplayValues(description.colorSecondaryId).text);
  }
  primaryValues = primaryValues.filter(v => !uselessStrings.has(v));

  let primaryString = "";
  if (share) {
    primaryString += `${share}%: `;
  }

  if (primaryValues.length > 0) {
    primaryString += `${primaryValues.join(", ")}`;
  }
  return primaryString;
};

const buildConsolidatedSecondaryString = (
  t: TFunction,
  description: LithologyDescription,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
) => {
  const secondaryValues: string[] = [];
  if (description.grainSizeId) {
    secondaryValues.push(getCodelistDisplayValues(description.grainSizeId).text);
  }
  if (description.grainAngularityId) {
    secondaryValues.push(getCodelistDisplayValues(description.grainAngularityId).text);
  }
  if (description.gradationId) {
    secondaryValues.push(getCodelistDisplayValues(description.gradationId).text);
  }
  if (description.cementationId) {
    secondaryValues.push(getCodelistDisplayValues(description.cementationId).text);
  }
  if (description.structureSynGenCodelistIds && description.structureSynGenCodelistIds.length > 0) {
    secondaryValues.push(...description.structureSynGenCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (description.structurePostGenCodelistIds && description.structurePostGenCodelistIds.length > 0) {
    secondaryValues.push(...description.structurePostGenCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  return secondaryValues.filter(v => !uselessStrings.has(v)).join(", ");
};

const buildConsolidatedDetailsString = (
  lithology: Lithology,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
) => {
  const details: string[] = [];
  if (lithology.textureMetaCodelistIds && lithology.textureMetaCodelistIds.length > 0) {
    details.push(...lithology.textureMetaCodelistIds.map(id => getCodelistDisplayValues(id).text));
  }
  if (lithology.alterationDegreeId) details.push(getCodelistDisplayValues(lithology.alterationDegreeId).text);

  return details.filter(d => !uselessStrings.has(d)).join(", ");
};

const buildLithologyDescription = (
  t: TFunction,
  description: LithologyDescription,
  share: number | undefined,
  buildPrimary: (
    t: TFunction,
    description: LithologyDescription,
    getCodelistDisplayValues: (id: number) => { text: string; code: string },
    share?: number,
  ) => string,
  buildSecondary: (
    t: TFunction,
    description: LithologyDescription,
    getCodelistDisplayValues: (id: number) => { text: string; code: string },
  ) => string,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
) => {
  let primaryString = buildPrimary(t, description, getCodelistDisplayValues, share);
  const secondaryString = buildSecondary(t, description, getCodelistDisplayValues);

  if (secondaryString.length > 0) primaryString += ", ";

  return (
    <Typography variant="body1" fontWeight={700}>
      {primaryString}
      {secondaryString.length > 0 && (
        <Typography component="span" variant="body1">
          {secondaryString}
        </Typography>
      )}
    </Typography>
  );
};

const buildUnconsolidatedLithologyDescription = (
  t: TFunction,
  description: LithologyDescription,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
  share?: number,
) =>
  buildLithologyDescription(
    t,
    description,
    share,
    buildUnconsolidatedPrimaryString,
    buildUnconsolidatedSecondaryString,
    getCodelistDisplayValues,
  );

const buildConsolidatedLithologyDescription = (
  t: TFunction,
  description: LithologyDescription,
  share: number | undefined,
  getCodelistDisplayValues: (id: number) => { text: string; code: string },
) =>
  buildLithologyDescription(
    t,
    description,
    share,
    buildConsolidatedPrimaryString,
    buildConsolidatedSecondaryString,
    getCodelistDisplayValues,
  );

interface LithologyLabelsProps {
  lithology: Lithology;
}

export const LithologyLabels: FC<LithologyLabelsProps> = ({ lithology }) => {
  const { t } = useTranslation();
  const getCodelistDisplayValues = useCodelistDisplayValues();

  if (lithology.isUnconsolidated) {
    const details1 = buildUnconsolidatedDetails1String(t, getCodelistDisplayValues, lithology);
    const details2 = buildUnconsolidatedDetails2String(getCodelistDisplayValues, lithology);
    return (
      <>
        {lithology.lithologyDescriptions?.map((description, index) => (
          <div key={`lithologyDescriptions-${description.id}`}>
            {buildUnconsolidatedLithologyDescription(
              t,
              description,
              getCodelistDisplayValues,
              getBeddingShare(lithology, index),
            )}
          </div>
        ))}
        {details1.length > 0 && <Typography variant="body2">{details1}</Typography>}
        {details2.length > 0 && <Typography variant="body2">{details2}</Typography>}
        {lithology.notes && <Typography variant="body2">{lithology.notes}</Typography>}
      </>
    );
  } else {
    const details = buildConsolidatedDetailsString(lithology, getCodelistDisplayValues);
    return (
      <>
        {lithology.lithologyDescriptions?.map((description, index) => (
          <div key={`lithologyDescriptions-${description.id}`}>
            {buildConsolidatedLithologyDescription(
              t,
              description,
              getBeddingShare(lithology, index),
              getCodelistDisplayValues,
            )}
          </div>
        ))}
        {details.length > 0 && <Typography variant="body2">{details}</Typography>}
        {lithology.notes && <Typography variant="body2">{lithology.notes}</Typography>}
      </>
    );
  }
};
