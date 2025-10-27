import { File } from "./file/fileInterfaces";

export class ApiError extends Error {
  status?: number;
  innerErrors?: Map<string, Error>;

  constructor(message: string, status?: number, innerErrors?: Map<string, ApiError>) {
    super(message);
    this.name = "ApiError";
    this.message = message;
    this.status = status;
    this.innerErrors = innerErrors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export enum Role {
  View = "View",
  Editor = "Editor",
  Controller = "Controller",
  Validator = "Validator",
  Publisher = "Publisher",
}

export type NullableDateString = Date | string | null;

export interface Workgroup {
  id: number;
  name: string;
  isDisabled?: boolean;
  disabledAt?: NullableDateString;
  createdAt?: NullableDateString;
  settings?: string;
  boreholeCount: number;
  roles?: Role[];
}

export interface WorkgroupRole {
  userId: number;
  workgroupId: number;
  role: Role;
  isActive?: boolean;
  workgroup?: Workgroup;
}

export interface Term {
  id: number;
  isDraft: boolean;
  textEn: string;
  textDe?: string;
  textFr?: string;
  textIt?: string;
  textRo?: string;
  creation: Date;
  expiration?: Date;
}

export interface TermsAccepted {
  userId: number;
  termId: number;
  term: Term;
  acceptedAt: Date;
}

export interface User {
  id: number;
  subjectId: string;
  name: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  deletable: boolean;
  isDisabled?: boolean;
  disabledAt?: NullableDateString;
  createdAt?: NullableDateString;
  settings?: string;
  workgroupRoles?: WorkgroupRole[];
  termsAccepted?: TermsAccepted[];
}

export enum EntityType {
  user = "User",
  workgroup = "Workgroup",
}

export interface Completion {
  id?: number;
  boreholeId: number;
}

export interface Instrumentation {
  id?: number;
  completionId: number;
}

export interface Backfill {
  id?: number;
  completionId: number;
}

export interface Casing {
  id?: number;
  completionId?: number;
  boreholeId?: number;
}

export interface Section {
  id?: number;
  boreholeId: number;
}

export interface GeometryFormat {
  csvHeader: string;
}

export interface Photo {
  id: number;
  boreholeId: number;
  name: string;
  nameUuid: string;
  fileType: string;
  fromDepth: number;
  toDepth: number;
  public: boolean;
  createdBy?: User;
  created?: NullableDateString;
  updatedBy?: User;
  updated?: NullableDateString;
}

export interface Document {
  id: number;
  boreholeId: number;
  url: string;
  description?: string;
  public: boolean;
  createdBy?: User;
  created?: NullableDateString;
  updatedBy?: User;
  updated?: NullableDateString;
}

export interface DocumentUpdate {
  id: number;
  url: string;
  description?: string;
  public: boolean;
}

export type BoreholeAttachment = File | Photo;
