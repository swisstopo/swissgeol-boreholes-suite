import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Tab, TabPanel } from "../../../components/tabs/tabPanel.tsx";
import { Photos } from "./table/photos.tsx";
import { Profiles } from "./table/profiles.tsx";

export const Attachments: FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const boreholeId = parseInt(id);

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: t("profiles"),
        hash: "profiles",
        component: <Profiles boreholeId={boreholeId} />,
      },
      {
        label: t("photos"),
        hash: "photos",
        component: <Photos boreholeId={boreholeId} />,
      },
    ],
    [boreholeId, t],
  );
  return <TabPanel tabs={tabs} />;
};
