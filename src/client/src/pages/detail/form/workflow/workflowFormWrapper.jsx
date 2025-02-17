// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import WorkflowForm from "./workflowForm";

const WorkflowFormWrapper = props => {
  const queryClient = useQueryClient();
  const { id } = useParams();

  return <WorkflowForm {...props} queryClient={queryClient} id={parseInt(id, 10)} />;
};

export default WorkflowFormWrapper;
