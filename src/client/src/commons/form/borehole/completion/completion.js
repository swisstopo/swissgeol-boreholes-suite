import React, { useState, useEffect, useCallback } from "react";
import { Button, Stack, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import {
  useCompletionMutations,
  useCompletions,
} from "../../../../api/fetchApiV2";
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

      <CompletionContent completion={selectedCompletion} />
    </Stack>
  );
};
export default Completion;
