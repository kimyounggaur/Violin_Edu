import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("public-safe");
const target = resolve("dist");

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true, force: true });

console.log("Copied public-safe assets to dist.");
