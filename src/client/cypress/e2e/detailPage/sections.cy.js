import { addItem, deleteItem, saveForm, saveWithSaveBar, startEditing } from "../helpers/buttonHelpers";
import { evaluateDisplayValue, evaluateInput, setInput, setSelect } from "../helpers/formHelpers";
import { BoreholeTab, navigateInBorehole } from "../helpers/navigationHelpers.js";
import {
  createBorehole,
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

const saveSection = method => {
  saveForm();
  cy.wait(`@section_${method}`);
  cy.wait("@section_GET");
};

describe("Section crud tests", () => {
  beforeEach(() => {
    createBorehole({ "extended.original_name": "GRICICAD" }).as("borehole_id");

    // open section editor
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/borehole#sections`);
    });

    // start editing session
    startBoreholeEditing();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(30);
  });

  it("adds, edits and deletes sections", () => {
    // create section
    addItem("addSection");
    cy.get('[data-cy="sectionElements.0.delete"]').should("be.disabled");
    cy.get('[data-cy="addsection-button"]').should("be.disabled");
    cy.get('[data-cy="save-button"]').should("be.disabled");

    setInput("name", "section-1");
    setInput("sectionElements.0.fromDepth", "0");
    setInput("sectionElements.0.toDepth", "10");

    cy.get('[data-cy="save-button"]').should("be.enabled");

    setSelect("sectionElements.0.drillingMethodId", 2);
    setSelect("sectionElements.0.cuttingsId", 2);
    setSelect("sectionElements.0.drillingMudTypeId", 3);
    setSelect("sectionElements.0.drillingMudSubtypeId", 2);
    setInput("sectionElements.0.drillingStartDate", "2023-01-01");
    setInput("sectionElements.0.drillingEndDate", "2023-01-02");
    setInput("sectionElements.0.drillingDiameter", "3.4");
    setInput("sectionElements.0.drillingCoreDiameter", "5.6");

    addItem("addSectionElement");
    cy.get('[data-cy="sectionElements.0.delete"]').should("be.enabled");
    cy.get('[data-cy="sectionElements.1.delete"]').should("be.enabled");

    evaluateInput("sectionElements.1.fromDepth", "0");
    evaluateInput("sectionElements.1.toDepth", "10");

    saveSection("POST");

    evaluateDisplayValue("section_name", "section-1");

    evaluateDisplayValue("0.fromdepth", "0");
    evaluateDisplayValue("0.todepth", "10");
    evaluateDisplayValue("0.drilling_method", "rotary coring");
    evaluateDisplayValue("0.cuttings", "cuttings");
    evaluateDisplayValue("0.drilling_mud_type", "pneumatic");
    evaluateDisplayValue("0.drilling_mud_subtype", "gas");
    evaluateDisplayValue("0.drilling_start_date", "01. Jan. 2023");
    evaluateDisplayValue("0.drilling_end_date", "02. Jan. 2023");
    evaluateDisplayValue("0.drill_diameter", "3.4");
    evaluateDisplayValue("0.drill_core_diameter", "5.6");
    evaluateDisplayValue("0.overcoring", "Yes");

    evaluateDisplayValue("1.fromdepth", "0");
    evaluateDisplayValue("1.todepth", "10");
    evaluateDisplayValue("1.drilling_method", "-");
    evaluateDisplayValue("1.cuttings", "-");
    evaluateDisplayValue("1.drilling_mud_type", "-");
    evaluateDisplayValue("1.drilling_mud_subtype", "-");
    evaluateDisplayValue("1.drilling_start_date", "-");
    evaluateDisplayValue("1.drilling_end_date", "-");
    evaluateDisplayValue("1.drill_diameter", "-");
    evaluateDisplayValue("1.drill_core_diameter", "-");
    evaluateDisplayValue("1.overcoring", "No");

    // update section
    startEditing();
    setInput("name", "section-1 updated");
    setSelect("sectionElements.1.drillingMethodId", 13);
    cy.get('[data-cy="sectionElements.0.delete"]').click();

    saveSection("PUT");
    evaluateDisplayValue("section_name", "section-1");
    evaluateDisplayValue("0.drilling_method", "auger drilling");
    evaluateDisplayValue("0.overcoring", "No");

    // delete section
    deleteItem();
    handlePrompt("Do you really want to delete this entry?", "cancel");
    cy.wait("@section_GET");
    cy.get('[data-cy="section-card.0"]').should("exist");

    deleteItem();
    handlePrompt("Do you really want to delete this entry?", "delete");
    cy.wait("@section_DELETE");
    cy.wait("@section_GET");
    cy.get('[data-cy="section-card.0"]').should("not.exist");
  });

  it("saves section with ctrl s without resetting content", () => {
    // add section and save with ctrl s
    addItem("addSection");
    setInput("name", "A");
    setInput("sectionElements.0.fromDepth", "0");
    setInput("sectionElements.0.toDepth", "1");
    setSelect("sectionElements.0.drillingMudTypeId", 5);
    cy.get("body").type("{ctrl}s");
    cy.wait("@section_POST");
    evaluateDisplayValue("0.drilling_mud_type", "water-based dispersed");

    // switch tab to borehole general tab and edit depth
    navigateInBorehole(BoreholeTab.general);
    setInput("totalDepth", 5);
    evaluateInput("totalDepth", "5");

    // click on sections without saving
    cy.get('[data-cy="sections-tab"]').click();
    const messageUnsavedChanges = "There are unsaved changes. Do you want to discard all changes?";
    handlePrompt(messageUnsavedChanges, "cancel");
    evaluateInput("totalDepth", "5");
    navigateInBorehole(BoreholeTab.sections, "discardchanges");

    // sections tab should be unchanged when retuning from borehole tab
    evaluateDisplayValue("0.drilling_mud_type", "water-based dispersed");

    // switch tab to borehole general tab and edit depth with saving
    navigateInBorehole(BoreholeTab.general);
    evaluateInput("totalDepth", "");
    setInput("totalDepth", 7);
    evaluateInput("totalDepth", "7");
    saveWithSaveBar();

    // edit sections tab and save again
    navigateInBorehole(BoreholeTab.sections);
    startEditing();
    setSelect("sectionElements.0.drillingMudTypeId", 4);
    cy.get("body").type("{ctrl}s");
    cy.wait("@section_PUT");
    evaluateDisplayValue("0.drilling_mud_type", "water-based non-dispersed");

    // borehole tab should still display saved depth value
    navigateInBorehole(BoreholeTab.general);
    evaluateInput("totalDepth", "7");
  });

  it("blocks navigation when there are unsaved changes", () => {
    addItem("addSection");
    setInput("name", "AA_CAPYBARA");
    getElementByDataCy("geometry-tab").click();
    const messageUnsavedChanges = "There are unsaved changes. Do you want to discard all changes?";
    handlePrompt(messageUnsavedChanges, "cancel");
    cy.location().should(location => {
      expect(location.hash).to.eq("#sections");
    });
    navigateInBorehole(BoreholeTab.geometry, "discardchanges");
    navigateInBorehole(BoreholeTab.sections);

    // section was not saved
    cy.contains("No sections available");

    addItem("addSection");
    setInput("name", "AA_CAPYBARA");
    setInput("sectionElements.0.fromDepth", "0");
    setInput("sectionElements.0.toDepth", "1");
    saveSection("POST");
    cy.get('[data-cy="section-card.0"]').should("exist");

    navigateInBorehole(BoreholeTab.geometry);
    navigateInBorehole(BoreholeTab.sections);

    // section was saved
    cy.contains("AA_CAPYBARA");
  });

  it("changes drillingMudSubtype select options based on drillingMudType", () => {
    addItem("addSection");
    setInput("name", "A");
    setInput("sectionElements.0.fromDepth", "0");
    setInput("sectionElements.0.toDepth", "1");

    setSelect("sectionElements.0.drillingMudTypeId", 5);
    setSelect("sectionElements.0.drillingMudSubtypeId", 2, 5);
    saveSection("POST");

    evaluateDisplayValue("0.drilling_mud_type", "water-based dispersed");
    evaluateDisplayValue(
      "0.drilling_mud_subtype",
      "lime, gypsum, NaCl, CaCl2, lignite, lignosulfonate, bentonite, polymers",
    );

    startEditing();
    setSelect("sectionElements.0.drillingMudTypeId", 3);
    saveSection("PUT");

    evaluateDisplayValue("0.drilling_mud_type", "pneumatic");
    evaluateDisplayValue("0.drilling_mud_subtype", "-"); // subtype was reset because it is not a subtype of pneumatic

    startEditing();
    setSelect("sectionElements.0.drillingMudSubtypeId", 2, 7);
    saveSection("PUT");

    evaluateDisplayValue("0.drilling_mud_type", "pneumatic");
    evaluateDisplayValue("0.drilling_mud_subtype", "gas");

    startEditing();
    setSelect("sectionElements.0.drillingMudSubtypeId", 5, 7);
    setSelect("sectionElements.0.drillingMudTypeId", 1);
    saveSection("PUT");

    evaluateDisplayValue("0.drilling_mud_type", "water");
    evaluateDisplayValue("0.drilling_mud_subtype", "other"); // subtype other is not reset when switching type

    startEditing();
    setSelect("sectionElements.0.drillingMudTypeId", 0); // reset
    setSelect("sectionElements.0.drillingMudSubtypeId", 0, 3); // still 3 options (Reset, other, not specified)
    saveSection("PUT");

    evaluateDisplayValue("0.drilling_mud_type", "-");
    evaluateDisplayValue("0.drilling_mud_subtype", "-");
  });
});
