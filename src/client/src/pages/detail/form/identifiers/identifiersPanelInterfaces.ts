import { BasicIdentifier, Identifier } from "../../../../api/borehole.ts";
import { Codelist } from "../../../../api/generated";
import { Workflow } from "../workflow/workflow.ts";

export interface IdentifiersFormInputs {
  boreholeCodelists: BasicIdentifier[];
}

export interface IdentifiersFormSubmission {
  boreholeCodelists: Identifier[];
  codelists?: Codelist[];
  workflow: Workflow | null;
}
