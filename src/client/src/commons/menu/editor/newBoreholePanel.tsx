import WorkgroupSelect from "./actions/workgroupSelect";
import { WorkgroupSelectProps } from "./actions/actionsInterfaces";
import { Button, Stack, Typography } from "@mui/material";
import { createBorehole } from "../../../api-lib";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AlertContext } from "../../../components/alert/alertContext";

const NewBoreholePanel = ({ workgroup, enabledWorkgroups, setWorkgroup }: WorkgroupSelectProps) => {
  const history = useHistory();
  const alertContext = useContext(AlertContext);
  const { t } = useTranslation();
  const handleBoreholeCreate = () => {
    // @ts-expect-error : The createBorehole function is not typed
    createBorehole(workgroup)
      // @ts-expect-error : The return of the createBorehole function is not typed
      .then((response: { data: { success: boolean; id: string; message: string } }) => {
        if (response.data.success) {
          history.push("/" + response.data.id);
        } else {
          alertContext.error(response.data.message);
          window.location.reload();
        }
      })
      .catch(function (error: string) {
        console.log(error);
      });
  };

  return (
    <>
      <Typography variant="h5" marginBottom="15px">
        {t("newBorehole")}
      </Typography>
      <Typography> {t("workgroup")}</Typography>
      <WorkgroupSelect workgroup={workgroup} enabledWorkgroups={enabledWorkgroups} setWorkgroup={setWorkgroup} />
      <Stack direction="column" justifyContent="flex-end">
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
