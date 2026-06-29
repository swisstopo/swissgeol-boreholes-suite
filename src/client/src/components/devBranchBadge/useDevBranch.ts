import { useEffect, useState } from "react";

const BRANCH_EVENT = "bdms:branch";

interface BranchEventPayload {
  branch: string;
}

export const useDevBranch = (): string => {
  const [branch, setBranch] = useState<string>(__BDMS_INITIAL_BRANCH__);

  useEffect(() => {
    if (!import.meta.hot) return;
    const handler = (data: BranchEventPayload) => setBranch(data.branch);
    import.meta.hot.on(BRANCH_EVENT, handler);
    return () => {
      import.meta.hot?.off(BRANCH_EVENT, handler);
    };
  }, []);

  return branch;
};
