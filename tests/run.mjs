import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const major = Number(process.versions.node.split(".")[0]);
if (major < 24) {
  console.error("Tests require Node.js 24 or newer (native TypeScript support and module hooks).");
  process.exit(1);
}
const args = process.argv.slice(2);
const suite = args.find((arg) => !arg.startsWith("--")) ?? "unit";
if (!["unit", "integration"].includes(suite)) {
  console.error("Usage: node tests/run.mjs [unit|integration] [--coverage]");
  process.exit(1);
}
const root = fileURLToPath(new URL("../", import.meta.url));
function discover(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    return entry.isDirectory() ? discover(path) : entry.name.endsWith(".test.mjs") ? [path] : [];
  });
}
const files = discover(`${root}tests/${suite}`).sort();
if (!files.length) throw new Error(`No tests found for ${suite}`);
const flags = ["--test"];
if (args.includes("--coverage")) flags.push("--experimental-test-coverage");
const result = spawnSync(process.execPath, [...flags, ...files], { cwd: root, stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
