import { createBorehole, handlePrompt, loginAsAdmin, startBoreholeEditing } from "../helpers/testHelpers";
import { evaluateDisplayValue, evaluateInput, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";

describe("Section crud tests", () => {
  beforeEach(() => {
    createBorehole({ "extended.original_name": "GRICICAD" }).as("borehole_id");

    // open section editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/borehole#sections`);
    });

    // start editing session
    startBoreholeEditing();
  });

  it("adds, edits and deletes sections", () => {
    // create section
    cy.wait(30);
    addItem("addSection");
    cy.wait("@codelist_GET");
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

    saveForm();
    cy.wait("@section_POST");
    cy.wait("@section_GET");

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
    cy.wait("@codelist_GET");

    setInput("name", "section-1 updated");
    setSelect("sectionElements.1.drillingMethodId", 13);
    cy.get('[data-cy="sectionElements.0.delete"]').click();

    saveForm();
    cy.wait("@section_PUT");
    evaluateDisplayValue("section_name", "section-1");
    evaluateDisplayValue("0.drilling_method", "auger drilling");
    evaluateDisplayValue("0.overcoring", "No");

    // delete section
    deleteItem();
    handlePrompt("Do you really want to delete this entry?", "Cancel");
    cy.wait("@section_GET");
    cy.get('[data-cy="section-card.0"]').should("exist");

    deleteItem();
    handlePrompt("Do you really want to delete this entry?", "Delete");
    cy.wait("@section_DELETE");
    cy.get('[data-cy="section-card.0"]').should("not.exist");
  });

  it("changes drillingMudSubtype select options based on drillingMudType", () => {
    cy.wait(30);
    addItem("addSection");
    cy.wait("@codelist_GET");
    setInput("name", "A");
    setInput("sectionElements.0.fromDepth", "0");
    setInput("sectionElements.0.toDepth", "1");

    setSelect("sectionElements.0.drillingMudTypeId", 5);
    setSelect("sectionElements.0.drillingMudSubtypeId", 2, 5);
    saveForm();

    evaluateDisplayValue("0.drilling_mud_type", "water-based dispersed");
    evaluateDisplayValue(
      "0.drilling_mud_subtype",
      "lime, gypsum, NaCl, CaCl2, lignite, lignosulfonate, bentonite, polymers",
    );

    startEditing();
    setSelect("sectionElements.0.drillingMudTypeId", 3);
    saveForm();

    evaluateDisplayValue("0.drilling_mud_type", "pneumatic");
    evaluateDisplayValue("0.drilling_mud_subtype", "-"); // subtype was reset because it is not a subtype of pneumatic

    startEditing();
    setSelect("sectionElements.0.drillingMudSubtypeId", 2, 7);
    saveForm();

    evaluateDisplayValue("0.drilling_mud_type", "pneumatic");
    evaluateDisplayValue("0.drilling_mud_subtype", "gas");

    startEditing();
    setSelect("sectionElements.0.drillingMudSubtypeId", 5, 7);
    setSelect("sectionElements.0.drillingMudTypeId", 1);
    saveForm();

    evaluateDisplayValue("0.drilling_mud_type", "water");
    evaluateDisplayValue("0.drilling_mud_subtype", "other"); // subtype other is not reset when switching type

    startEditing();
    setSelect("sectionElements.0.drillingMudTypeId", 0); // reset
    setSelect("sectionElements.0.drillingMudSubtypeId", 0, 3); // still 3 options (Reset, other, not specified)
    saveForm();

    evaluateDisplayValue("0.drilling_mud_type", "-");
    evaluateDisplayValue("0.drilling_mud_subtype", "-");
  });
});
