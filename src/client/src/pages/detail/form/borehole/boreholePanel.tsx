import { forwardRef, SyntheticEvent, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { BdmsTab, BdmsTabContentBox, BdmsTabs } from "../../../../components/styledTabComponents.jsx";
import { UseFormWithSaveBar } from "../useFormWithSaveBar.ts";
import { BoreholeForm } from "./boreholeForm.tsx";
import { BoreholeFormInputs, BoreholePanelProps } from "./boreholePanelInterfaces";
import Geometry from "./geometry.jsx";
import Sections from "./sections.jsx";

export const BoreholePanel = forwardRef(
  ({ boreholeId, borehole, editingEnabled, onDirtyChange, onSubmit }: BoreholePanelProps, ref) => {
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);
    const formMethods = useForm<BoreholeFormInputs>({
      mode: "onChange",
      defaultValues: {
        typeId: borehole.typeId,
        purposeId: borehole.purposeId,
        statusId: borehole.statusId,
        totalDepth: borehole.totalDepth,
        qtDepthId: borehole.qtDepthId,
        topBedrockFreshMd: borehole.topBedrockFreshMd,
        topBedrockWeatheredMd: borehole.topBedrockWeatheredMd,
        lithologyTopBedrockId: borehole.lithologyTopBedrockId,
        lithostratigraphyId: borehole.lithostratigraphyId,
        chronostratigraphyId: borehole.chronostratigraphyId,
        hasGroundwater: borehole.hasGroundwater === true ? 1 : borehole.hasGroundwater === false ? 0 : 2,
        remarks: borehole.remarks,
      },
    });

    UseFormWithSaveBar({
      formMethods,
      onDirtyChange,
      onSubmit,
      ref,
    });

    const tabs = [
      {
        label: t("general"),
        hash: "general",
      },
      { label: t("sections"), hash: "sections" },
      { label: t("boreholeGeometry"), hash: "geometry" },
    ];

    const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
      setActiveIndex(index);
      const newLocation = location.pathname + "#" + tabs[index].hash;
      if (location.pathname + location.hash !== newLocation) {
        history.push(newLocation);
      }
    };

    useEffect(() => {
      const newTabIndex = tabs.findIndex(t => t.hash === location.hash.replace("#", ""));
      if (newTabIndex > -1 && activeIndex !== newTabIndex) {
        handleIndexChange(null, newTabIndex);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.hash]);

    useEffect(() => {
      if (!location.hash) {
        history.replace(location.pathname + "#" + tabs[activeIndex].hash);
      }
      // eslint-disable-next-line
    }, []);

    return (
      <>
        <BdmsTabs value={activeIndex} onChange={handleIndexChange}>
          {tabs.map(tab => {
            return <BdmsTab data-cy={tab.hash + "-tab"} label={tab.label} key={tab.hash} />;
          })}
        </BdmsTabs>
        <BdmsTabContentBox flex="1 0 0" sx={{ overflow: "auto" }}>
          {activeIndex === 0 && (
            <>
              <DevTool control={formMethods.control} placement="top-right" />
              <FormProvider {...formMethods}>
                <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                  <BoreholeForm borehole={borehole} editingEnabled={editingEnabled} formMethods={formMethods} />
                </form>
              </FormProvider>
            </>
          )}
          {activeIndex === 1 && <Sections isEditable={editingEnabled} boreholeId={boreholeId} />}
          {activeIndex === 2 && (
            <Geometry isEditable={editingEnabled} boreholeId={boreholeId} measuredDepth={borehole?.totalDepth} />
          )}
        </BdmsTabContentBox>
      </>
    );
  },
);
