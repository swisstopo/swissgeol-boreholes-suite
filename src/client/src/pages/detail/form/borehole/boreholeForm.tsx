import { useCallback, useEffect, useState } from "react";
import { Stack } from "@mui/system";
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
import { BoreholeDetailProps } from "./boreholePanelInterfaces.ts";

export const BoreholeForm = ({ formMethods, borehole, editingEnabled }: BoreholeDetailProps) => {
  const [totalDepthTVD, setTotalDepthTVD] = useState(null);
  const [topBedrockFreshTVD, setTopBedrockFreshTVD] = useState(null);
  const [topBedrockWeatheredTVD, setTopBedrockWeatheredTVD] = useState(null);
  const roundTvdValue = (value: number | undefined) => {
    return value ? Math.round(value * 100) / 100 : "";
  };

  const totalDepth = formMethods.watch("totalDepth");
  const topBedrockFreshMd = formMethods.watch("topBedrockFreshMd");
  const topBedrockWeatheredMd = formMethods.watch("topBedrockWeatheredMd");

  const fetchDepthTVD = useCallback(
    async (fieldName: string, fieldValue: number | null) => {
      if (fieldValue) {
        const getDepthTVD = async (depthMD: number | null) => {
          if (depthMD == null) {
            return null;
          } else {
            const response = await getBoreholeGeometryDepthTVD(borehole.id, depthMD);
            return response ?? null;
          }
        };

        let depth = await getDepthTVD(parseFloatWithThousandsSeparator(fieldValue.toString()));
        depth = roundTvdValue(depth);
        // setTopBedrockWeatheredTVD(depth);
        return depth;
      }
    },
    [borehole.id],
  );
  //
  useEffect(() => {
    const fetchAndSetTotalDepthTVD = async () => {
      const tvd = await fetchDepthTVD("totalDepthTVD", totalDepth);
      setTotalDepthTVD(tvd);
    };
    fetchAndSetTotalDepthTVD();
  }, [fetchDepthTVD, totalDepth]);

  useEffect(() => {
    const fetchAndSetTotalDepthTVD = async () => {
      const tvd = await fetchDepthTVD("topBedrockFreshTVD", topBedrockFreshMd);
      setTopBedrockFreshTVD(tvd);
    };
    fetchAndSetTotalDepthTVD();
  }, [fetchDepthTVD, topBedrockFreshMd]);

  useEffect(() => {
    const fetchAndSetTotalDepthTVD = async () => {
      const tvd = await fetchDepthTVD("topBedrockWeatheredTVD", topBedrockWeatheredMd);
      setTopBedrockWeatheredTVD(tvd);
    };
    fetchAndSetTotalDepthTVD();
  }, [fetchDepthTVD, topBedrockWeatheredMd]);

  return (
    <Stack gap={3} mr={2}>
      <FormSegmentBox>
        <FormContainer>
          <FormContainer direction="row">
            <FormDomainSelect
              fieldName={"typeId"}
              label={"borehole_type"}
              schemaName={"borehole_type"}
              readonly={!editingEnabled}
              selected={borehole.typeId}
            />
            <FormDomainSelect
              fieldName={"purposeId"}
              label={"purpose"}
              schemaName={"extended.purpose"}
              readonly={!editingEnabled}
              selected={borehole.purposeId}
            />
            <FormDomainSelect
              fieldName={"statusId"}
              label={"boreholestatus"}
              schemaName={"extended.status"}
              readonly={!editingEnabled}
              selected={borehole.statusId}
            />
          </FormContainer>
          <FormContainer>
            <FormContainer direction="row">
              <FormInput
                fieldName={"totalDepth"}
                label={"totaldepth"}
                value={borehole?.totalDepth || ""}
                withThousandSeparator={true}
                readonly={!editingEnabled}
              />
              <FormDomainSelect
                fieldName={"qtDepthId"}
                label={"qt_depth"}
                schemaName={"depth_precision"}
                readonly={!editingEnabled}
                selected={borehole.qtDepthId}
              />
              <FormInputDisplayOnly label={"total_depth_tvd"} value={totalDepthTVD} withThousandSeparator={true} />
            </FormContainer>
          </FormContainer>
          <FormContainer direction="row">
            <FormInput
              fieldName={"topBedrockFreshMd"}
              label={"top_bedrock_fresh_md"}
              value={borehole?.topBedrockFreshMd || ""}
              withThousandSeparator={true}
              readonly={!editingEnabled}
            />
            <FormInputDisplayOnly
              label={"top_bedrock_fresh_tvd"}
              value={topBedrockFreshTVD}
              withThousandSeparator={true}
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput
              fieldName={"topBedrockWeatheredMd"}
              label={"top_bedrock_weathered_md"}
              value={borehole?.topBedrockWeatheredMd || ""}
              withThousandSeparator={true}
              readonly={!editingEnabled}
            />
            <FormInputDisplayOnly
              label={"top_bedrock_weathered_tvd"}
              value={topBedrockWeatheredTVD}
              withThousandSeparator={true}
            />
          </FormContainer>
          <FormDomainSelect
            fieldName={"lithologyTopBedrockId"}
            label={"lithology_top_bedrock"}
            schemaName={"custom.lithology_top_bedrock"}
            readonly={!editingEnabled}
            selected={borehole.lithologyTopBedrockId}
          />
          <FormDomainSelect
            fieldName={"lithostratigraphyId"}
            label={"lithostratigraphy_top_bedrock"}
            schemaName={"custom.lithostratigraphy_top_bedrock"}
            readonly={!editingEnabled}
            selected={borehole.lithostratigraphyId}
          />
          <FormDomainSelect
            fieldName={"chronostratigraphyId"}
            label={"chronostratigraphy_top_bedrock"}
            schemaName={"custom.chronostratigraphy_top_bedrock"}
            readonly={!editingEnabled}
            selected={borehole.chronostratigraphyId}
          />
          <FormBooleanSelect
            canReset={false}
            readonly={!editingEnabled}
            fieldName={"hasGroundwater"}
            label="groundwater"
            selected={borehole.hasGroundwater}
          />
          <FormInput
            fieldName={"remarks"}
            multiline={true}
            label={"remarks"}
            value={borehole?.remarks || ""}
            readonly={!editingEnabled}
          />
        </FormContainer>
      </FormSegmentBox>
    </Stack>
  );
};
