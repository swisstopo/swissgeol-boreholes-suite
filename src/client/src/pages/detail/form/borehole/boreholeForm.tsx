import { forwardRef, useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { getBoreholeGeometryDepthTVD } from "../../../../api/fetchApiV2.js";
import {
  FormBooleanSelect,
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormInputDisplayOnly,
} from "../../../../components/form/form.ts";
import { parseFloatWithThousandsSeparator } from "../../../../components/legacyComponents/formUtils.ts";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";
import { UseFormWithSaveBar } from "../useFormWithSaveBar.ts";
import { BoreholeDetailProps, BoreholeFormInputs } from "./boreholePanelInterfaces.ts";

export const BoreholeForm = forwardRef(({ borehole, onSubmit }: BoreholeDetailProps, ref) => {
  const [totalDepthTVD, setTotalDepthTVD] = useState<number | null>(null);
  const [topBedrockFreshTVD, setTopBedrockFreshTVD] = useState<number | null>(null);
  const [topBedrockWeatheredTVD, setTopBedrockWeatheredTVD] = useState<number | null>(null);
  const roundTvdValue = (value: number | null) => {
    return value ? Math.round(value * 100) / 100 : null;
  };

  const formMethods = useForm<BoreholeFormInputs>({
    mode: "onChange",
    defaultValues: {
      typeId: borehole.typeId,
      purposeId: borehole.purposeId,
      statusId: borehole.statusId,
      totalDepth: borehole.totalDepth,
      depthPrecisionId: borehole.depthPrecisionId,
      topBedrockFreshMd: borehole.topBedrockFreshMd,
      topBedrockWeatheredMd: borehole.topBedrockWeatheredMd,
      lithologyTopBedrockId: borehole.lithologyTopBedrockId,
      lithostratigraphyTopBedrockId: borehole.lithostratigraphyTopBedrockId,
      chronostratigraphyTopBedrockId: borehole.chronostratigraphyTopBedrockId,
      hasGroundwater: borehole.hasGroundwater === true ? 1 : borehole.hasGroundwater === false ? 0 : 2,
      topBedrockIntersected:
        borehole.topBedrockIntersected === true ? 1 : borehole.topBedrockIntersected === false ? 0 : 2,
      remarks: borehole.remarks,
    },
  });

  const totalDepth = formMethods.watch("totalDepth");
  const topBedrockFreshMd = formMethods.watch("topBedrockFreshMd");
  const topBedrockWeatheredMd = formMethods.watch("topBedrockWeatheredMd");

  UseFormWithSaveBar({
    formMethods,
    onSubmit,
    ref,
  });

  const fetchDepthTVD = useCallback(
    async (fieldValue: number | null) => {
      // check if fieldValue is effectively zero
      if (fieldValue !== null && Math.abs(fieldValue) === 0) {
        return fieldValue;
      }
      if (!fieldValue) return null;
      const getDepthTVD = async (depthMD: number | null) => {
        if (depthMD == null) {
          return null;
        } else {
          const response = await getBoreholeGeometryDepthTVD(borehole.id, depthMD);
          return response ?? null;
        }
      };

      const depth = await getDepthTVD(parseFloatWithThousandsSeparator(fieldValue.toString()));
      return roundTvdValue(depth);
    },
    [borehole.id],
  );

  // update topBedrockintersected when editing topBedrockFreshMd or topBedrockWeatheredMD
  useEffect(() => {
    const topBedrockFreshMdUpdated = topBedrockFreshMd != borehole.topBedrockFreshMd;
    const topBedrockWeatheredMdUpdated = topBedrockWeatheredMd != borehole.topBedrockWeatheredMd;
    if (topBedrockFreshMdUpdated || topBedrockWeatheredMdUpdated) {
      const intersectedValue = topBedrockFreshMd || topBedrockWeatheredMd ? 1 : 2; // 1:yes, 2: not defined
      formMethods.setValue("topBedrockIntersected", intersectedValue);
    }
  }, [
    borehole.topBedrockFreshMd,
    borehole.topBedrockWeatheredMd,
    formMethods,
    topBedrockFreshMd,
    topBedrockWeatheredMd,
  ]);

  useEffect(() => {
    const fetchAndSetTotalDepthTVD = async () => {
      setTotalDepthTVD(await fetchDepthTVD(totalDepth));
    };
    fetchAndSetTotalDepthTVD();
  }, [fetchDepthTVD, totalDepth]);

  useEffect(() => {
    const fetchAndSetTotalDepthTVD = async () => {
      setTopBedrockFreshTVD(await fetchDepthTVD(topBedrockFreshMd));
    };
    fetchAndSetTotalDepthTVD();
  }, [fetchDepthTVD, topBedrockFreshMd]);

  useEffect(() => {
    const fetchAndSetTotalDepthTVD = async () => {
      setTopBedrockWeatheredTVD(await fetchDepthTVD(topBedrockWeatheredMd));
    };
    fetchAndSetTotalDepthTVD();
  }, [fetchDepthTVD, topBedrockWeatheredMd]);

  return (
    <>
      <DevTool control={formMethods.control} placement="top-right" />
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <FormSegmentBox>
            <FormContainer>
              <FormContainer direction="row">
                <FormDomainSelect
                  fieldName={"typeId"}
                  label={"borehole_type"}
                  schemaName={"borehole_type"}
                  selected={borehole.typeId}
                />
                <FormDomainSelect
                  fieldName={"purposeId"}
                  label={"purpose"}
                  schemaName={"extended.purpose"}
                  selected={borehole.purposeId}
                />
                <FormDomainSelect
                  fieldName={"statusId"}
                  label={"boreholestatus"}
                  schemaName={"extended.status"}
                  selected={borehole.statusId}
                />
              </FormContainer>
              <FormContainer>
                <FormContainer direction="row">
                  <FormInput
                    fieldName={"totalDepth"}
                    label={"totaldepth"}
                    value={borehole?.totalDepth}
                    controlledValue={totalDepth ?? ""}
                    withThousandSeparator={true}
                  />
                  <FormDomainSelect
                    fieldName={"depthPrecisionId"}
                    label={"qt_depth"}
                    schemaName={"depth_precision"}
                    selected={borehole.depthPrecisionId}
                  />
                  <FormInputDisplayOnly label={"total_depth_tvd"} value={totalDepthTVD} withThousandSeparator={true} />
                </FormContainer>
              </FormContainer>
              <FormContainer direction="row">
                <FormInput
                  fieldName={"topBedrockWeatheredMd"}
                  label={"top_bedrock_weathered_md"}
                  value={borehole?.topBedrockWeatheredMd}
                  controlledValue={topBedrockWeatheredMd ?? ""}
                  withThousandSeparator={true}
                />
                <FormInputDisplayOnly
                  label={"top_bedrock_weathered_tvd"}
                  value={topBedrockWeatheredTVD}
                  withThousandSeparator={true}
                />
              </FormContainer>
              <FormContainer direction="row">
                <FormInput
                  fieldName={"topBedrockFreshMd"}
                  label={"top_bedrock_fresh_md"}
                  value={borehole?.topBedrockFreshMd}
                  controlledValue={topBedrockFreshMd ?? ""}
                  withThousandSeparator={true}
                />
                <FormInputDisplayOnly
                  label={"top_bedrock_fresh_tvd"}
                  value={topBedrockFreshTVD}
                  withThousandSeparator={true}
                />
              </FormContainer>
              <FormContainer direction="row" width="50%">
                <FormBooleanSelect
                  sx={{ mr: 1 }}
                  canReset={false}
                  fieldName={"topBedrockIntersected"}
                  label="topBedrockIntersected"
                  selected={borehole.topBedrockIntersected}
                />
              </FormContainer>
              <FormContainer direction="row">
                <FormDomainSelect
                  fieldName={"lithologyTopBedrockId"}
                  label={"lithology_top_bedrock"}
                  schemaName={"custom.lithology_top_bedrock"}
                  selected={borehole.lithologyTopBedrockId}
                />
                <FormDomainSelect
                  fieldName={"lithostratigraphyTopBedrockId"}
                  label={"lithostratigraphy_top_bedrock"}
                  schemaName={"custom.lithostratigraphy_top_bedrock"}
                  selected={borehole.lithostratigraphyTopBedrockId}
                />
              </FormContainer>
              <FormContainer direction="row">
                <FormDomainSelect
                  fieldName={"chronostratigraphyTopBedrockId"}
                  label={"chronostratigraphy_top_bedrock"}
                  schemaName={"custom.chronostratigraphy_top_bedrock"}
                  selected={borehole.chronostratigraphyTopBedrockId}
                />
                <FormBooleanSelect
                  canReset={false}
                  fieldName={"hasGroundwater"}
                  label="groundwater"
                  selected={borehole.hasGroundwater}
                />
              </FormContainer>
              <FormInput fieldName={"remarks"} multiline={true} label={"remarks"} value={borehole?.remarks} />
            </FormContainer>
          </FormSegmentBox>
        </form>
      </FormProvider>
    </>
  );
});
