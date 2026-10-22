import { Role } from "@swissgeol/ui-core";
import { describe, expect, it } from "vitest";
import { UserWorkgroupRole } from "../../../../api/generated/types.gen";
import { getWorkflowRoleInWorkgroup } from "./workflowRole.ts";

const workgroupRoles: UserWorkgroupRole[] = [
  { userId: 7, workgroupId: 1, role: "Editor" },
  { userId: 7, workgroupId: 2, role: "Publisher" },
  { userId: 7, workgroupId: 3, role: "Controller" },
  { userId: 7, workgroupId: 4, role: "View" },
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
