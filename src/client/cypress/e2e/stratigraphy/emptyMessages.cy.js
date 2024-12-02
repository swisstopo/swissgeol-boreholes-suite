import { newUneditableBorehole, selectByDataCyAttribute, startBoreholeEditing } from "../helpers/testHelpers";

describe("Messages for empty profiles", () => {
  beforeEach(() => {
    newUneditableBorehole().as("borehole_id");
  });

  it("Displays correct messages for stratigraphy", () => {
    selectByDataCyAttribute("stratigraphy-menu-item").click();
    selectByDataCyAttribute("lithology-menu-item").click();
    selectByDataCyAttribute("stratigraphy-message").should("contain", "No stratigraphy available");
    startBoreholeEditing();
    selectByDataCyAttribute("stratigraphy-message").should(
      "contain",
      "For the recording of a stratigraphic profile please click the plus symbol at the top left",
    );
  });
});
