import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, Stack } from "@mui/material";
import { getBoreholeGeometryDepthTVD } from "../../../../api/fetchApiV2.ts";
import {
  FormBooleanSelect,
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormInputDisplayOnly,
  FormValueType,
} from "../../../../components/form/form.ts";
import { convertValueToBoolean, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";
import { BaseForm } from "../baseForm.tsx";
import NameSegment from "../location/nameSegment.tsx";
import RestrictionSegment from "../location/restrictionSegment.tsx";
import { BoreholeFormInputs, BoreholeProps } from "./boreholePanelInterfaces.ts";

export const BoreholeForm: FC<BoreholeProps> = ({ borehole }) => {
  const [totalDepthTVD, setTotalDepthTVD] = useState<number | null>(null);
  const [topBedrockFreshTVD, setTopBedrockFreshTVD] = useState<number | null>(null);
  const [topBedrockWeatheredTVD, setTopBedrockWeatheredTVD] = useState<number | null>(null);
  const roundTvdValue = (value: number | null) => {
    return value ? Math.round(value * 100) / 100 : null;
  };

  const formMethods = useForm<BoreholeFormInputs>({
    mode: "onChange",
    defaultValues: {
      name: borehole.name,
      originalName: borehole.originalName,
      projectName: borehole.projectName,
      restrictionId: borehole.restrictionId,
      restrictionUntil: borehole.restrictionUntil,
      nationalInterest: borehole.nationalInterest === true ? 1 : borehole.nationalInterest === false ? 0 : 2,
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

  const prepareBoreholeDataForSubmit = useCallback((formInputs: BoreholeFormInputs) => {
    const data = { ...formInputs };
    data.restrictionId = data.restrictionId ?? null;
    data.restrictionUntil = data?.restrictionUntil ? data.restrictionUntil.toString() : null;
    data.nationalInterest = convertValueToBoolean(data?.nationalInterest);
    data.name = data?.name ?? data.originalName;
    data.totalDepth = parseFloatWithThousandsSeparator(data?.totalDepth);
    data.topBedrockFreshMd = parseFloatWithThousandsSeparator(data?.topBedrockFreshMd);
    data.topBedrockWeatheredMd = parseFloatWithThousandsSeparator(data?.topBedrockWeatheredMd);
    data.hasGroundwater = convertValueToBoolean(data?.hasGroundwater);
    data.topBedrockIntersected = convertValueToBoolean(data?.topBedrockIntersected);
    data.boreholeFiles = null;
    data.workflow = null;

    return data;
  }, []);

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
    const { dirtyFields } = formMethods.formState;
    if (dirtyFields.topBedrockFreshMd || dirtyFields.topBedrockWeatheredMd) {
      const intersectedValue = topBedrockFreshMd || topBedrockWeatheredMd ? 1 : 2; // 1:yes, 2: not defined
      formMethods.setValue("topBedrockIntersected", intersectedValue);
    }
  }, [formMethods, topBedrockFreshMd, topBedrockWeatheredMd]);

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
    <BaseForm formMethods={formMethods} prepareDataForSubmit={prepareBoreholeDataForSubmit} tabStatusToReset="general">
      <Stack>
        <FormContainer>
          <NameSegment borehole={borehole} formMethods={formMethods}></NameSegment>
          <RestrictionSegment borehole={borehole} formMethods={formMethods}></RestrictionSegment>
          <Card>
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
                    schemaName={"drilling_purpose"}
                    selected={borehole.purposeId}
                  />
                  <FormDomainSelect
                    fieldName={"statusId"}
                    label={"boreholestatus"}
                    schemaName={"borehole_status"}
                    selected={borehole.statusId}
                  />
                </FormContainer>
                <FormContainer>
                  <FormContainer direction="row">
                    <FormInput
                      fieldName={"totalDepth"}
                      label={"totaldepth"}
                      value={borehole?.totalDepth}
                      type={FormValueType.Number}
                    />
                    <FormDomainSelect
                      fieldName={"depthPrecisionId"}
                      label={"qt_depth"}
                      schemaName={"depth_precision"}
                      selected={borehole.depthPrecisionId}
                    />
                    <FormInputDisplayOnly label={"total_depth_tvd"} value={totalDepthTVD} type={FormValueType.Number} />
                  </FormContainer>
                </FormContainer>
                <FormContainer direction="row">
                  <FormInput
                    fieldName={"topBedrockWeatheredMd"}
                    label={"top_bedrock_weathered_md"}
                    value={borehole?.topBedrockWeatheredMd}
                    type={FormValueType.Number}
                  />
                  <FormInputDisplayOnly
                    label={"top_bedrock_weathered_tvd"}
                    value={topBedrockWeatheredTVD}
                    type={FormValueType.Number}
                  />
                </FormContainer>
                <FormContainer direction="row">
                  <FormInput
                    fieldName={"topBedrockFreshMd"}
                    label={"top_bedrock_fresh_md"}
                    value={borehole?.topBedrockFreshMd}
                    type={FormValueType.Number}
                  />
                  <FormInputDisplayOnly
                    label={"top_bedrock_fresh_tvd"}
                    value={topBedrockFreshTVD}
                    type={FormValueType.Number}
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
                    schemaName={"lithology_con"}
                    selected={borehole.lithologyTopBedrockId}
                  />
                  <FormDomainSelect
                    fieldName={"lithostratigraphyTopBedrockId"}
                    label={"lithostratigraphy_top_bedrock"}
                    schemaName={"lithostratigraphy"}
                    selected={borehole.lithostratigraphyTopBedrockId}
                  />
                </FormContainer>
                <FormContainer direction="row">
                  <FormDomainSelect
                    fieldName={"chronostratigraphyTopBedrockId"}
                    label={"chronostratigraphy_top_bedrock"}
                    schemaName={"chronostratigraphy"}
                    selected={borehole.chronostratigraphyTopBedrockId}
                  />
                  <FormBooleanSelect
                    canReset={false}
                    fieldName={"hasGroundwater"}
                    label="groundwater"
                    selected={borehole.hasGroundwater}
                  />
                </FormContainer>
              </FormContainer>
            </FormSegmentBox>
          </Card>
          <Card>
            <FormSegmentBox>
              <FormContainer direction="row">
                <FormInput fieldName={"remarks"} multiline={true} label={"remarks"} value={borehole?.remarks} />
              </FormContainer>
            </FormSegmentBox>
          </Card>
        </FormContainer>
      </Stack>
    </BaseForm>
  );
};
