import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridEventListener } from "@mui/x-data-grid";
import { User, Workgroup } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroups } from "../../../api/workgroup.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { WorkgroupTable } from "./workgroupTable.tsx";

interface WorkgroupAdministrationProps {
  users: User[];
}

export const WorkgroupAdministration: FC<WorkgroupAdministrationProps> = ({ users }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [workgroups, setWorkgroups] = useState<Workgroup[]>();
  const { callApiWithErrorHandling } = useApiRequest();

  useEffect(() => {
    setIsLoading(true);
    const getWorkgroups = async () => {
      const workgroups: Workgroup[] = await callApiWithErrorHandling(fetchWorkgroups, []);
      setWorkgroups(workgroups);
      setIsLoading(false);
    };
    getWorkgroups();
  }, [callApiWithErrorHandling, t]);

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    console.log(`navigate to /setting/workgroup/${params.row.id}`);
  };

  return (
    <WorkgroupTable
      isDisabled={false}
      workgroups={workgroups ?? []}
      users={users}
      setWorkgroups={setWorkgroups}
      isLoading={isLoading}
      handleRowClick={handleRowClick}
    />
  );
};
