import { describe, expect, it } from "vitest";
import { User } from "../../../api/generated";
import { getRoleInWorkgroup, getWorkgroupsWithRole } from "./workgroupRoles.ts";

const user: User = {
  id: 7,
  workgroupRoles: [
    { userId: 7, workgroupId: 1, role: "Editor", workgroup: { id: 1, name: "Default" } },
    { userId: 7, workgroupId: 2, role: "Publisher", workgroup: { id: 2, name: "Reggae" } },
    { userId: 7, workgroupId: 3, workgroup: { id: 3, name: "Without role" } },
    { userId: 7, workgroupId: 4, role: "View" },
  ],
};

describe("getWorkgroupsWithRole", () => {
  it("lists each workgroup with the user's role in it", () => {
    expect(getWorkgroupsWithRole(user)).toEqual([
      { id: 1, name: "Default", role: "Editor" },
      { id: 2, name: "Reggae", role: "Publisher" },
    ]);
  });

  it("returns no workgroups for a user without roles", () => {
    expect(getWorkgroupsWithRole({ id: 8 })).toEqual([]);
  });
});

describe("getRoleInWorkgroup", () => {
  it("returns the user's role in the workgroup", () => {
    expect(getRoleInWorkgroup(user, 2)).toBe("Publisher");
  });

  it("returns undefined for a workgroup the user is not in", () => {
    expect(getRoleInWorkgroup(user, 99)).toBeUndefined();
  });
});
