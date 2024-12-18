import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Button, Stack } from "@mui/material";
import { createBorehole } from "../../../api-lib";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { SideDrawerHeader } from "../layout/sideDrawerHeader.tsx";
import { NewBoreholeProps } from "./commons/actionsInterfaces.ts";
import WorkgroupSelect from "./commons/workgroupSelect.tsx";

const NewBoreholePanel = ({ workgroupId, enabledWorkgroups, setWorkgroupId, toggleDrawer }: NewBoreholeProps) => {
  const history = useHistory();
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();
  const handleBoreholeCreate = () => {
    // @ts-expect-error : The createBorehole function is not typed
    createBorehole(parseInt(workgroupId))
      // @ts-expect-error : The return of the createBorehole function is not typed
      .then((response: { data: { success: boolean; id: string; message: string } }) => {
        if (response.data.success) {
          history.push("/" + response.data.id);
        } else {
          showAlert(response.data.message, "error");
          window.location.reload();
        }
      })
      .catch(function (error: string) {
        console.log(error);
      });
  };

  return (
    <>
      <SideDrawerHeader title={t("newBorehole")} toggleDrawer={toggleDrawer} />
      <Stack direction="column" spacing={3}>
        <WorkgroupSelect
          workgroupId={workgroupId}
          enabledWorkgroups={enabledWorkgroups}
          setWorkgroupId={setWorkgroupId}
        />
        <Button
          variant="outlined"
          data-cy={"create-button"}
          disabled={enabledWorkgroups?.length === 0}
          onClick={handleBoreholeCreate}>
          {t("create")}
        </Button>
      </Stack>
    </>
  );
};

export default NewBoreholePanel;
