import { Role } from "@swissgeol/ui-core";
import { describe, expect, it } from "vitest";
import { UserWorkgroupRole } from "../../../../api/generated";
import { canPublishInWorkgroup, canViewWorkflow, getWorkflowRoleInWorkgroup } from "./workflowRole.ts";

const workgroupRoles: UserWorkgroupRole[] = [
  { userId: 7, workgroupId: 1, role: "Editor" },
  { userId: 7, workgroupId: 2, role: "Publisher" },
  { userId: 7, workgroupId: 3, role: "Reviewer" },
  { userId: 7, workgroupId: 4, role: "Reader" },
  { userId: 7, workgroupId: 5 },
];

describe("getWorkflowRoleInWorkgroup", () => {
  it("uses the role in the given workgroup, not the highest role across workgroups", () => {
    expect(getWorkflowRoleInWorkgroup(workgroupRoles, 1)).toBe(Role.Editor);
  });

  it("maps each role to its workflow role", () => {
    expect(getWorkflowRoleInWorkgroup(workgroupRoles, 2)).toBe(Role.Publisher);
    expect(getWorkflowRoleInWorkgroup(workgroupRoles, 3)).toBe(Role.Reviewer);
    expect(getWorkflowRoleInWorkgroup(workgroupRoles, 4)).toBe(Role.Reader);
  });

  it("falls back to reader without a role in the workgroup", () => {
    expect(getWorkflowRoleInWorkgroup(workgroupRoles, 5)).toBe(Role.Reader);
    expect(getWorkflowRoleInWorkgroup(workgroupRoles, 99)).toBe(Role.Reader);
    expect(getWorkflowRoleInWorkgroup(undefined, 1)).toBe(Role.Reader);
  });
});

describe("canViewWorkflow", () => {
  const user = { isAdmin: false, workgroupRoles };

  it("lets editors, reviewers and publishers of the workgroup view the status", () => {
    expect(canViewWorkflow(user, 1)).toBe(true);
    expect(canViewWorkflow(user, 2)).toBe(true);
    expect(canViewWorkflow(user, 3)).toBe(true);
  });

  it("hides the status from readers and users without a role in the workgroup", () => {
    expect(canViewWorkflow(user, 4)).toBe(false);
    expect(canViewWorkflow(user, 5)).toBe(false);
    expect(canViewWorkflow(user, 99)).toBe(false);
    expect(canViewWorkflow(undefined, 1)).toBe(false);
  });

  it("lets admins view the status of every workgroup", () => {
    expect(canViewWorkflow({ isAdmin: true, workgroupRoles: [] }, 99)).toBe(true);
  });
});

describe("canPublishInWorkgroup", () => {
  const user = { isAdmin: false, workgroupRoles };

  it("lets only publishers of the workgroup publish", () => {
    expect(canPublishInWorkgroup(user, 2)).toBe(true);
    expect(canPublishInWorkgroup(user, 1)).toBe(false);
    expect(canPublishInWorkgroup(user, 3)).toBe(false);
    expect(canPublishInWorkgroup(user, 4)).toBe(false);
    expect(canPublishInWorkgroup(undefined, 2)).toBe(false);
  });

  it("lets admins publish in every workgroup", () => {
    expect(canPublishInWorkgroup({ isAdmin: true, workgroupRoles: [] }, 99)).toBe(true);
  });
});
