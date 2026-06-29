/* global process */
import { execFileSync } from "node:child_process";
import { unwatchFile, watchFile } from "node:fs";
import { resolve } from "node:path";

const BRANCH_EVENT = "bdms:branch";
const POLL_INTERVAL_MS = 250;
const UNKNOWN = "unknown";

const readBranch = cwd => {
  const ref = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd }).toString().trim();
  if (ref !== "HEAD") return ref;
  // Detached HEAD: fall back to short SHA, wrapped in parentheses to make the state visually distinct.
  const sha = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd }).toString().trim();
  return `(${sha})`;
};

const readHeadPath = cwd => {
  // --git-path resolves the worktree-specific HEAD file, which lives under the parent repo's .git/worktrees/<name>/.
  const raw = execFileSync("git", ["rev-parse", "--git-path", "HEAD"], { cwd }).toString().trim();
  return resolve(cwd, raw);
};

/** @returns {import('vite').Plugin} */
export const devBranchPlugin = () => {
  let current = UNKNOWN;

  return {
    name: "bdms:dev-branch",
    apply: "serve",
    config() {
      try {
        current = readBranch(process.cwd());
      } catch {
        // Not a git checkout (or git missing): leave current as UNKNOWN; the badge will hide itself.
      }
      return { define: { __BDMS_INITIAL_BRANCH__: JSON.stringify(current) } };
    },
    configureServer(server) {
      let headPath;
      try {
        headPath = readHeadPath(server.config.root);
      } catch {
        return;
      }

      // Vite's chokidar watcher has **/.git/** in its default `ignored` list, so server.watcher.add()
      // is silently dropped for files under .git/. fs.watchFile polls fs.stat instead and works everywhere.
      const onChange = () => {
        try {
          const next = readBranch(server.config.root);
          if (next !== current) {
            current = next;
            server.ws.send({ type: "custom", event: BRANCH_EVENT, data: { branch: next } });
          }
        } catch {
          // Transient git failure during a rebase or checkout race: keep the previous value.
        }
      };

      watchFile(headPath, { interval: POLL_INTERVAL_MS }, onChange);
      server.httpServer?.once("close", () => unwatchFile(headPath, onChange));

      // Surface the watched path once so users can confirm the plugin picked up the right HEAD.
      server.config.logger.info(`[dev-branch] watching ${headPath} (current: ${current})`);
    },
  };
};
