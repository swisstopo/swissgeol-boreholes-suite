import { Photo, Profile } from "./generated";

export class ApiError extends Error {
  status?: number;
  messageKey?: string;

  constructor(message: string, status?: number, messageKey?: string) {
    super(message);
    this.name = "ApiError";
    this.message = message;
    this.status = status;
    this.messageKey = messageKey;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export type NullableDateString = Date | string | null;
export type NullableBooleanSelect = number | boolean | null; // Number as select options parsed to boolean

export enum EntityType {
  user = "User",
  workgroup = "Workgroup",
}

export interface GeometryFormat {
  csvHeader: string;
}

export type BoreholeAttachment = Profile | Photo;

export type { UserWorkgroupRole as WorkgroupRole } from "./generated/types.gen";
