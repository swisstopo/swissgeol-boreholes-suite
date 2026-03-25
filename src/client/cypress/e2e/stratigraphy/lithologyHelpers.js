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
} from "../helpers/formHelpers.js";
import { handlePrompt } from "../helpers/testHelpers.js";

export const checkHasBedding = (hasBedding, share) => {
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

export const isUnconsolidatedForm = isUnconsolidated => {
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

export const switchRockType = (newRockType, action) => {
  const isUnconsolidated = newRockType === RockType.unconsolidated;
  const otherRockType = isUnconsolidated ? RockType.consolidated : RockType.unconsolidated;
  cy.contains("button", newRockType).click();
  handlePrompt(
    `When switching from ${otherRockType.toLowerCase()} to ${newRockType.toLowerCase()} existing values in the form will be lost. Would you like to continue?`,
    action,
  );
  isUnconsolidatedForm((action === "Continue" && isUnconsolidated) || (action !== "Continue" && !isUnconsolidated));
};

const descriptionSelectFields = [
  "lithologyUnconMainId",
  "lithologyUncon2Id",
  "lithologyUncon3Id",
  "lithologyUncon4Id",
  "lithologyUncon5Id",
  "lithologyUncon6Id",
  "colorPrimaryId",
  "colorSecondaryId",
];

const descriptionMultiSelectFields = [
  "componentUnconOrganicCodelistIds",
  "componentUnconDebrisCodelistIds",
  "grainShapeCodelistIds",
  "grainAngularityCodelistIds",
  "lithologyUnconDebrisCodelistIds",
];

const topLevelSelectFields = ["compactnessId", "cohesionId", "humidityId", "consistencyId", "plasticityId", "uscsDeterminationId", "alterationDegreeId"];

const topLevelMultiSelectFields = ["uscsTypeCodelistIds", "rockConditionCodelistIds"];

/**
 * Fills the unconsolidated lithology form with the given values.
 * @param {object} values
 * @param {number} [values.fromDepth] - The start depth.
 * @param {number} [values.toDepth] - The end depth.
 * @param {boolean} [values.hasBedding] - Whether bedding is enabled. Assumes form starts with hasBedding unchecked.
 * @param {number} [values.share] - The bedding share (0-100). Only applied when hasBedding is true.
 * @param {object[]} [values.lithologyDescriptions] - Array of description objects.
 * @param {number} [values.compactnessId] - Index for the compactness dropdown.
 * @param {number} [values.cohesionId] - Index for the cohesion dropdown.
 * @param {number} [values.humidityId] - Index for the humidity dropdown.
 * @param {number} [values.consistencyId] - Index for the consistency dropdown.
 * @param {number} [values.plasticityId] - Index for the plasticity dropdown.
 * @param {number[]} [values.uscsTypeCodelistIds] - Indices for the USCS type multi-select.
 * @param {number} [values.uscsDeterminationId] - Index for the USCS determination dropdown.
 * @param {number[]} [values.rockConditionCodelistIds] - Indices for the rock condition multi-select.
 * @param {number} [values.alterationDegreeId] - Index for the alteration degree dropdown.
 * @param {string} [values.notes] - Notes text.
 */
export const fillUnconsolidatedLithologyForm = ({
  fromDepth,
  toDepth,
  hasBedding,
  share,
  lithologyDescriptions,
  notes,
  ...rest
}) => {
  if (fromDepth !== undefined) setInput("fromDepth", fromDepth);
  if (toDepth !== undefined) setInput("toDepth", toDepth);

  if (hasBedding === true) {
    toggleCheckbox("hasBedding");
    if (share !== undefined) {
      setInput("share", share);
    }
  }

  if (lithologyDescriptions) {
    lithologyDescriptions.forEach((desc, i) => {
      descriptionSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          setSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
      descriptionMultiSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          toggleMultiSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
      if (desc.hasStriae) {
        toggleCheckbox(`lithologyDescriptions.${i}.hasStriae`);
      }
    });
  }

  topLevelSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      setSelect(field, rest[field]);
    }
  });

  topLevelMultiSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      toggleMultiSelect(field, rest[field]);
    }
  });

  if (notes !== undefined) {
    setInput("notes", notes);
  }
};

/**
 * Evaluates the state of the unconsolidated lithology form against the given values.
 * Select fields expect the displayed text value, multi-select fields expect an array of chip label strings.
 * @param {object} values
 * @param {number} [values.fromDepth] - Expected start depth.
 * @param {number} [values.toDepth] - Expected end depth.
 * @param {boolean} [values.hasBedding] - Expected bedding state.
 * @param {number} [values.share] - Expected share value. Only evaluated when hasBedding is true.
 * @param {object[]} [values.lithologyDescriptions] - Array of expected description values.
 * @param {number} [values.compactnessId] - Expected compactness text.
 * @param {number} [values.cohesionId] - Expected cohesion text.
 * @param {number} [values.humidityId] - Expected humidity text.
 * @param {number} [values.consistencyId] - Expected consistency text.
 * @param {number} [values.plasticityId] - Expected plasticity text.
 * @param {string[]} [values.uscsTypeCodelistIds] - Expected USCS type chip labels.
 * @param {string} [values.uscsDeterminationId] - Expected USCS determination text.
 * @param {string[]} [values.rockConditionCodelistIds] - Expected rock condition chip labels.
 * @param {string} [values.alterationDegreeId] - Expected alteration degree text.
 * @param {string} [values.notes] - Expected notes text.
 */
export const evaluateUnconsolidatedLithologyForm = ({
  fromDepth,
  toDepth,
  hasBedding,
  share,
  lithologyDescriptions,
  notes,
  ...rest
}) => {
  if (fromDepth !== undefined) evaluateInput("fromDepth", formatWithThousandsSeparator(fromDepth));
  if (toDepth !== undefined) evaluateInput("toDepth", formatWithThousandsSeparator(toDepth));

  if (hasBedding !== undefined) {
    checkHasBedding(hasBedding, hasBedding ? share : undefined);
  }

  if (lithologyDescriptions) {
    lithologyDescriptions.forEach((desc, i) => {
      descriptionSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          evaluateSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
      descriptionMultiSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          evaluateMultiSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
      if (desc.hasStriae !== undefined) {
        evaluateCheckbox(`lithologyDescriptions.${i}.hasStriae`, desc.hasStriae);
      }
    });
  }

  topLevelSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      evaluateSelect(field, rest[field]);
    }
  });

  topLevelMultiSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      evaluateMultiSelect(field, rest[field]);
    }
  });

  if (notes !== undefined) {
    evaluateTextarea("notes", notes);
  }
};

const consolidatedDescriptionSelectFields = [
  "lithologyConId",
  "colorPrimaryId",
  "colorSecondaryId",
  "grainSizeId",
  "grainAngularityId",
  "gradationId",
  "cementationId",
];

const consolidatedDescriptionMultiSelectFields = [
  "componentConParticleCodelistIds",
  "componentConMineralCodelistIds",
  "structureSynGenCodelistIds",
  "structurePostGenCodelistIds",
];

const consolidatedTopLevelSelectFields = ["alterationDegreeId"];

const consolidatedTopLevelMultiSelectFields = ["textureMetaCodelistIds"];

/**
 * Fills the consolidated lithology form with the given values.
 * @param {object} values
 * @param {number} [values.fromDepth] - The start depth.
 * @param {number} [values.toDepth] - The end depth.
 * @param {boolean} [values.hasBedding] - Whether bedding is enabled. Assumes form starts with hasBedding unchecked.
 * @param {number} [values.share] - The bedding share (0-100). Only applied when hasBedding is true.
 * @param {object[]} [values.lithologyDescriptions] - Array of description objects.
 * @param {string} [values.alterationDegreeId] - Index for the alteration degree dropdown.
 * @param {number[]} [values.textureMetaCodelistIds] - Indices for the texture meta multi-select.
 * @param {string} [values.notes] - Notes text.
 */
export const fillConsolidatedLithologyForm = ({
  fromDepth,
  toDepth,
  hasBedding,
  share,
  lithologyDescriptions,
  notes,
  ...rest
}) => {
  if (fromDepth !== undefined) setInput("fromDepth", fromDepth);
  if (toDepth !== undefined) setInput("toDepth", toDepth);

  if (hasBedding === true) {
    toggleCheckbox("hasBedding");
    if (share !== undefined) {
      setInput("share", share);
    }
  }

  if (lithologyDescriptions) {
    lithologyDescriptions.forEach((desc, i) => {
      consolidatedDescriptionSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          setSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
      consolidatedDescriptionMultiSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          toggleMultiSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
    });
  }

  consolidatedTopLevelSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      setSelect(field, rest[field]);
    }
  });

  consolidatedTopLevelMultiSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      toggleMultiSelect(field, rest[field]);
    }
  });

  if (notes !== undefined) {
    setInput("notes", notes);
  }
};

/**
 * Evaluates the state of the consolidated lithology form against the given values.
 * Select fields expect the displayed text value, multi-select fields expect an array of chip label strings.
 * @param {object} values
 * @param {number} [values.fromDepth] - Expected start depth.
 * @param {number} [values.toDepth] - Expected end depth.
 * @param {boolean} [values.hasBedding] - Expected bedding state.
 * @param {number} [values.share] - Expected share value. Only evaluated when hasBedding is true.
 * @param {object[]} [values.lithologyDescriptions] - Array of expected description values.
 * @param {string} [values.alterationDegreeId] - Expected alteration degree text.
 * @param {string[]} [values.textureMetaCodelistIds] - Expected texture meta chip labels.
 * @param {string} [values.notes] - Expected notes text.
 */
export const evaluateConsolidatedLithologyForm = ({
  fromDepth,
  toDepth,
  hasBedding,
  share,
  lithologyDescriptions,
  notes,
  ...rest
}) => {
  if (fromDepth !== undefined) evaluateInput("fromDepth", formatWithThousandsSeparator(fromDepth));
  if (toDepth !== undefined) evaluateInput("toDepth", formatWithThousandsSeparator(toDepth));

  if (hasBedding !== undefined) {
    checkHasBedding(hasBedding, hasBedding ? share : undefined);
  }

  if (lithologyDescriptions) {
    lithologyDescriptions.forEach((desc, i) => {
      consolidatedDescriptionSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          evaluateSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
      consolidatedDescriptionMultiSelectFields.forEach(field => {
        if (desc[field] !== undefined) {
          evaluateMultiSelect(`lithologyDescriptions.${i}.${field}`, desc[field]);
        }
      });
    });
  }

  consolidatedTopLevelSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      evaluateSelect(field, rest[field]);
    }
  });

  consolidatedTopLevelMultiSelectFields.forEach(field => {
    if (rest[field] !== undefined) {
      evaluateMultiSelect(field, rest[field]);
    }
  });

  if (notes !== undefined) {
    evaluateTextarea("notes", notes);
  }
};

/**
 * Fills the lithological description form with the given values.
 * @param {object} values
 * @param {number} [values.fromDepth] - Index of the start depth option in the dropdown.
 * @param {number} [values.toDepth] - Index of the end depth option in the dropdown.
 * @param {string} [values.description] - Description text.
 */
export const fillLithologicalDescriptionForm = ({ fromDepth, fromDepthExpected, toDepth, toDepthExpected, description }) => {
  if (fromDepth !== undefined) setSelect("fromDepth", fromDepth, fromDepthExpected);
  if (toDepth !== undefined) setSelect("toDepth", toDepth, toDepthExpected);
  if (description !== undefined) setInput("description", description);
};

/**
 * Evaluates the state of the lithological description form against the given values.
 * @param {object} values
 * @param {number|string} [values.fromDepth] - Expected start depth value shown in the dropdown.
 * @param {number|string} [values.toDepth] - Expected end depth value shown in the dropdown.
 * @param {string} [values.description] - Expected description text.
 */
export const evaluateLithologicalDescriptionForm = ({ fromDepth, toDepth, description }) => {
  if (fromDepth !== undefined) evaluateSelect("fromDepth", formatWithThousandsSeparator(fromDepth));
  if (toDepth !== undefined) evaluateSelect("toDepth", formatWithThousandsSeparator(toDepth));
  if (description !== undefined) evaluateTextarea("description", description);
};

/**
 * Fills the facies description form with the given values.
 * @param {object} values
 * @param {number} [values.fromDepth] - Index of the start depth option in the dropdown.
 * @param {number} [values.toDepth] - Index of the end depth option in the dropdown.
 * @param {number} [values.faciesId] - Index of the facies option in the dropdown.
 * @param {string} [values.description] - Description text.
 */
export const fillFaciesDescriptionForm = ({ fromDepth, fromDepthExpected, toDepth, toDepthExpected, faciesId, description }) => {
  if (fromDepth !== undefined) setSelect("fromDepth", fromDepth, fromDepthExpected);
  if (toDepth !== undefined) setSelect("toDepth", toDepth, toDepthExpected);
  if (faciesId !== undefined) setSelect("faciesId", faciesId);
  if (description !== undefined) setInput("description", description);
};

/**
 * Evaluates the state of the facies description form against the given values.
 * @param {object} values
 * @param {number|string} [values.fromDepth] - Expected start depth value shown in the dropdown.
 * @param {number|string} [values.toDepth] - Expected end depth value shown in the dropdown.
 * @param {string} [values.faciesId] - Expected facies text value.
 * @param {string} [values.description] - Expected description text.
 */
export const evaluateFaciesDescriptionForm = ({ fromDepth, toDepth, faciesId, description }) => {
  if (fromDepth !== undefined) evaluateSelect("fromDepth", formatWithThousandsSeparator(fromDepth));
  if (toDepth !== undefined) evaluateSelect("toDepth", formatWithThousandsSeparator(toDepth));
  if (faciesId !== undefined) evaluateSelect("faciesId", faciesId);
  if (description !== undefined) evaluateTextarea("description", description);
};
