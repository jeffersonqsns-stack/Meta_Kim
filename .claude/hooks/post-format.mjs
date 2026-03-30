#!/usr/bin/env node

/**
 * PostToolUse hook: auto-format JS/TS files after Edit/Write
 * Runs prettier on the modified file if it's a .js/.ts/.jsx/.tsx file
 */

import { execSync } from "node:child_process";

const input = JSON.parse(process.argv[2] || "{}");
const toolName = input.tool_name || "";
const filePath = input.tool_params?.file_path || input.tool_params?.path || "";

if (!["Edit", "Write"].includes(toolName)) process.exit(0);
if (!filePath.match(/\.(js|ts|jsx|tsx|mjs|cjs)$/)) process.exit(0);

try {
  execSync(`npx prettier --write "${filePath}"`, {
    stdio: "ignore",
    timeout: 10000,
  });
} catch {
  // prettier not available or failed — no big deal
}
