export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.message = message;
    this.status = status;
  }
}

export enum Role {
  View = "View",
  Editor = "Editor",
  Controller = "Controller",
  Validator = "Validator",
  Publisher = "Publisher",
}

export interface Workgroup {
  id: number;
  name: string;
  isDisabled?: boolean;
  disabledAt?: Date | string;
  createdAt?: Date | string;
  settings?: string;
  boreholeCount: number;
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
  isDisabled?: boolean;
  disabledAt?: Date | string;
  createdAt?: Date | string;
  settings?: string;
  workgroupRoles?: WorkgroupRole[];
  acceptedTerms?: TermsAccepted[];
}
