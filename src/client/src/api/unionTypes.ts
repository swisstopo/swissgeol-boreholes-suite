import { Photo, Profile } from "./generated";

export type NullableDateString = Date | string | null;
export type NullableBooleanSelect = number | boolean | null; // Number as select options parsed to boolean
export type NullableNumberString = number | string | null; // Number that need to be parsed as string with thousands separator

export type BoreholeAttachment = Profile | Photo;
