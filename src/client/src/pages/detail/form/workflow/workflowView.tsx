import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import type { SgcWorkflowSelectionEntry } from "@swisstopo/swissgeol-ui-core";
import { SgcButton, SgcWorkflow } from "@swisstopo/swissgeol-ui-core-react";
import { useCurrentUser } from "../../../../api/user.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { DetailContext } from "../../detailContext.tsx";
import { useWorkflow, WorkflowChange } from "./workflow.ts";
import { WorkflowAssignedUserCard } from "./workflowAssignedUserCard.tsx";
import { WorkflowStatusCard } from "./workflowStatusCard.tsx";
import { WorkflowTabs } from "./workflowTabs.tsx";

export const WorkflowView = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));
  const { editingEnabled } = useContext(DetailContext);
  const { data: user } = useCurrentUser();

  const { t } = useTranslation();

  const makeSelectionEntries = (): SgcWorkflowSelectionEntry<string>[] => {
    const field = (name: string) => ({
      field: name,
      name: () => t(name),
    });
    return [
      {
        name: () => t("borehole"),
        fields: [field("general"), field("section")],
      },
      {
        name: () => t("stratigraphy"),
        fields: [field("chronostratigraphy"), field("lithology"), field("lithostratigraphy")],
      },
      {
        name: () => t("completion"),
        fields: [field("casing"), field("instrumentation"), field("backfill")],
      },
      {
        name: () => t("hydrogeology"),
        fields: [field("waterIngress"), field("groundwater"), field("fieldMeasurement"), field("hydrotest")],
      },
      {
        name: () => t("attachments"),
        fields: [field("profiles"), field("photo")],
      },
    ];
  };

  if (!workflow) return;

  // Todo .net api Model does not match the type from the core library
  // created => createdAt
  // createdBy => creator
  // assignee => toAssignee
  // fromAssignee => missing in the .net api model
  const renamePropertyInArray = (array: WorkflowChange[], oldName: keyof WorkflowChange, newName: string) => {
    return array.map(obj => {
      const { [oldName]: value, ...rest } = obj;
      return { ...rest, [newName]: value, fromAssignee: user, createdAt: new Date(obj.created) };
    });
  };

  let updatedChanges = renamePropertyInArray(workflow.changes, "createdBy", "creator");
  updatedChanges = renamePropertyInArray(updatedChanges, "assignee", "toAssignee");
  const updatedWorkflow = { ...workflow, changes: updatedChanges };

  return (
    <Stack gap={1.5} direction="row">
      <Stack gap={1.5} sx={{ flexShrink: 0 }}>
        <WorkflowStatusCard />
        <WorkflowAssignedUserCard />
      </Stack>
      <Box sx={{ flexGrow: 0 }} width={"100%"}>
        <WorkflowTabs />
      </Box>
      <SgcWorkflow
        workflow={updatedWorkflow}
        review={updatedWorkflow.reviewedTabs}
        approval={updatedWorkflow.publishedTabs}
        isReadOnly={!editingEnabled}
        selection={makeSelectionEntries()}
        onWorkflowReviewChange={e => console.log("hi on review Change", e.detail)} // change event is not triggered if everything is deselected
        onWorkflowApprovalChange={e => console.log("hi on approval Change", e.detail)}
      />
    </Stack>
  );
};
