import { fetchApiV2Legacy } from "../../../../../api/fetchApiV2.ts";
import { Codelist } from "../../../../../components/codelist.ts";
import { Observation } from "../Observation.ts";

export interface WaterIngress extends Observation {
  quantityId: number;
  quantity: Codelist;
  conditionsId: string | number | null;
  conditions: Codelist;
}

export const getWaterIngress = async (boreholeId: number) => {
  return await fetchApiV2Legacy(`wateringress?boreholeId=${boreholeId}`, "GET");
};

export const addWaterIngress = async (wateringress: WaterIngress) => {
  return await fetchApiV2Legacy("wateringress", "POST", wateringress);
};

export const updateWaterIngress = async (wateringress: WaterIngress) => {
  return await fetchApiV2Legacy("wateringress", "PUT", wateringress);
};

export const deleteWaterIngress = async (id: number) => {
  return await fetchApiV2Legacy(`wateringress?id=${id}`, "DELETE");
};
