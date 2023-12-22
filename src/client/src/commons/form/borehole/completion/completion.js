import React, { useState, useEffect } from "react";
import { Stack } from "@mui/material";
import { useCompletions } from "../../../../api/fetchApiV2";
import CompletionContent from "./completionContent";

const Completion = props => {
  const { isEditable, boreholeId } = props;
  const { data: completions, isSuccess } = useCompletions(boreholeId);
  const [selectedCompletion, setSelectedCompletion] = useState(null);

  useEffect(() => {
    if (isSuccess && completions && completions.length > 0) {
      setSelectedCompletion(completions[0]);
    }
  }, [isSuccess, completions]);

  return (
    <Stack direction="column">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <>Tabs & Buttons</>
      </Stack>
      <>Completion Header</>

      <CompletionContent
        completion={selectedCompletion}
        isEditable={isEditable}
      />
    </Stack>
  );
};
export default Completion;
