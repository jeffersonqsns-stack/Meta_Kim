#!/usr/bin/env node

/**
 * PostToolUse hook: TypeScript type-check after editing .ts/.tsx files
 * Runs tsc --noEmit and outputs warnings (non-blocking)
 */

import { execSync } from "node:child_process";

const input = JSON.parse(process.argv[2] || "{}");
const toolName = input.tool_name || "";
const filePath = input.tool_params?.file_path || input.tool_params?.path || "";

if (!["Edit", "Write"].includes(toolName)) process.exit(0);
if (!filePath.match(/\.(ts|tsx)$/)) process.exit(0);

try {
  execSync("npx tsc --noEmit --pretty", {
    stdio: "pipe",
    timeout: 30000,
  });
} catch (err) {
  const output = err.stdout?.toString() || "";
  if (output.includes("error TS")) {
    process.stderr.write(`[tsc] Type errors detected after editing ${filePath}\n`);
  }
}
