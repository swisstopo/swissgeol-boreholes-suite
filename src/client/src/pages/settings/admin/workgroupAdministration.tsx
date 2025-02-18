import { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridEventListener } from "@mui/x-data-grid";
import { Workgroup } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroups } from "../../../api/workgroup.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";
import { WorkgroupTable } from "./workgroupTable.tsx";

export const WorkgroupAdministration: FC = () => {
  const { t } = useTranslation();
  const [workgroups, setWorkgroups] = useState<Workgroup[]>();
  const { users } = useContext(UserAdministrationContext);
  const { workgroupTableSortModel, setworkgroupTableSortModel } = useContext(WorkgroupAdministrationContext);
  const { callApiWithErrorHandling } = useApiRequest();

  useEffect(() => {
    const getWorkgroups = async () => {
      const workgroups: Workgroup[] = await callApiWithErrorHandling(fetchWorkgroups, []);
      setWorkgroups(workgroups);
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
      handleRowClick={handleRowClick}
      sortModel={workgroupTableSortModel}
      setSortModel={setworkgroupTableSortModel}
    />
  );
};
