export enum Role {
  View,
  Editor,
  Controller,
  Validator,
  Publisher,
}

export interface Workgroup {
  // TODO: Add boreholes
  id: number;
  name: string;
  created?: Date;
  disabled?: Date;
  settings?: string;
  isSupplier?: boolean;
}

export interface WorkgroupRole {
  userId: number;
  user: User;
  workgroupId: number;
  workgroup: Workgroup;
  role: Role;
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
  user: User;
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
