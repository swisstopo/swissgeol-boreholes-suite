import { BoreholeSubmission } from "../location/locationPanelInterfaces.tsx";
import { BoreholeFormInputs } from "./boreholePanelInterfaces.ts";

export const prepareBoreholeDataForSubmit = (formInputs: BoreholeFormInputs) => {
  return { ...formInputs } as BoreholeSubmission;
};
