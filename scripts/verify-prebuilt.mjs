import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const requiredFiles = ["dist/index.js", "dist/public/index.html"];

try {
  await Promise.all(requiredFiles.map((file) => access(resolve(file), constants.R_OK)));
  console.log("Prebuilt production bundle verified.");
} catch {
  console.error("Missing prebuilt production bundle. Run `npm run build:local` before deploying this repository.");
  process.exit(1);
}
