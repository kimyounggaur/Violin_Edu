import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import os from "node:os";

const thisFile = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(thisFile), "..");
const currentMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
const isInnerRun = process.argv.includes("--inner-build");
const bundledNode = join(
  os.homedir(),
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "node",
  "bin",
  process.platform === "win32" ? "node.exe" : "node"
);

function nodeMajor(nodePath) {
  const result = spawnSync(nodePath, ["--version"], {
    cwd: projectRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    return null;
  }

  const version = (result.stdout || result.stderr).trim().replace(/^v/, "");
  return Number.parseInt(version.split(".")[0] ?? "0", 10);
}

function run(nodePath, args) {
  const result = spawnSync(nodePath, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!isInnerRun && currentMajor >= 25 && existsSync(bundledNode)) {
  const bundledMajor = nodeMajor(bundledNode);

  if (bundledMajor && bundledMajor < currentMajor) {
    console.log(`Using bundled Node ${bundledMajor}.x for Vite build stability.`);
    run(bundledNode, [thisFile, "--inner-build"]);
    process.exit(0);
  }
}

run(process.execPath, ["node_modules/typescript/bin/tsc", "-b"]);
run(process.execPath, ["node_modules/vite/bin/vite.js", "build"]);
run(process.execPath, ["scripts/copy-public.mjs"]);
