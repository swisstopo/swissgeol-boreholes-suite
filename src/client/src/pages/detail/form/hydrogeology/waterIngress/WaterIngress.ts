import { fetchApiV2 } from "../../../../../api/fetchApiV2";
import { Codelist } from "../../../../../components/Codelist.ts";
import { Observation } from "../Observation.ts";

export interface WaterIngress extends Observation {
  quantityId: number;
  quantity: Codelist;
  conditionsId: string | number | null;
  conditions: Codelist;
}

export const getWaterIngress = async (boreholeId: number) => {
  return await fetchApiV2(`wateringress?boreholeId=${boreholeId}`, "GET");
};

export const addWaterIngress = async (wateringress: WaterIngress) => {
  return await fetchApiV2("wateringress", "POST", wateringress);
};

export const updateWaterIngress = async (wateringress: WaterIngress) => {
  return await fetchApiV2("wateringress", "PUT", wateringress);
};

export const deleteWaterIngress = async (id: number) => {
  return await fetchApiV2(`wateringress?id=${id}`, "DELETE");
};
