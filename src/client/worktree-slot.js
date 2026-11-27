/* global process */
// A worktree can run its own api, database and OIDC mock in a slot (see docker-compose.worktree.yml), so
// that several worktrees run e2e tests side by side. BDMS_SLOT picks the slot from 1 to 9 and moves every
// port the client and the e2e tests depend on. Without a slot they use the ports of the main stack.
const slot = process.env.BDMS_SLOT;

if (slot && !/^[1-9]$/.test(slot)) {
  throw new Error(`BDMS_SLOT must be a slot from 1 to 9, but is "${slot}".`);
}

export const stackPorts = slot
  ? { client: Number(`3${slot}00`), api: Number(`5${slot}00`), oidc: Number(`4${slot}11`) }
  : { client: 3000, api: 5000, oidc: 4011 };
