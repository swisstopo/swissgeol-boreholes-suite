import { useQuery } from "@tanstack/react-query";
import { getCasings } from "../../../../api/fetchApiV2.ts";

export function useCasings(parentId: number) {
  return useQuery({
    queryKey: ["casings", parentId],
    queryFn: () => getCasings(parentId),
    enabled: !!parentId,
  });
}
