import { FC, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { GridEventListener } from "@mui/x-data-grid";
import { Workgroup } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroups } from "../../../api/workgroup.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";
import { WorkgroupTable } from "./workgroupTable.tsx";

export const WorkgroupAdministration: FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { users } = useContext(UserAdministrationContext);
  const { workgroups, setWorkgroups, setSelectedWorkgroup, workgroupTableSortModel, setworkgroupTableSortModel } =
    useContext(WorkgroupAdministrationContext);
  const { callApiWithErrorHandling } = useApiRequest();

  useEffect(() => {
    setSelectedWorkgroup(null);
    const getWorkgroups = async () => {
      const workgroups: Workgroup[] = await callApiWithErrorHandling(fetchWorkgroups, []);
      setWorkgroups(workgroups);
    };
    getWorkgroups();
  }, [callApiWithErrorHandling, setSelectedWorkgroup, setWorkgroups, t]);

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    history.push(`/setting/workgroup/${params.row.id}`);
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
