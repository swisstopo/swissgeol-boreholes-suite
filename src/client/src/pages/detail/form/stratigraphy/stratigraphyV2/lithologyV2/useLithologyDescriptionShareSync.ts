import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Lithology } from "../../lithology.ts";

export function useLithologyDescriptionShareSync(formMethods: UseFormReturn<Lithology>) {
  const { setValue, watch } = formMethods;
  const hasBedding = watch("hasBedding");
  const share = watch("share");

  useEffect(() => {
    if (hasBedding && share && String(share) !== "" && !Number.isNaN(Number(share))) {
      setValue("shareInverse", 100 - Number(share));
    } else {
      setValue("shareInverse", undefined);
    }
  }, [hasBedding, setValue, share]);
}
