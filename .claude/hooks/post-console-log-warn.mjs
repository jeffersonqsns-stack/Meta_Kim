#!/usr/bin/env node

/**
 * PostToolUse hook: warn about console.log in edited files
 * Non-blocking — just emits a stderr warning
 */

import { readFileSync } from "node:fs";

const input = JSON.parse(process.argv[2] || "{}");
const toolName = input.tool_name || "";
const filePath = input.tool_params?.file_path || input.tool_params?.path || "";

if (!["Edit", "Write"].includes(toolName)) process.exit(0);
if (!filePath.match(/\.(js|ts|jsx|tsx|mjs|cjs)$/)) process.exit(0);

try {
  const content = readFileSync(filePath, "utf8");
  const matches = content.match(/console\.(log|debug|info)\(/g);
  if (matches && matches.length > 0) {
    process.stderr.write(
      `[warn] ${filePath} contains ${matches.length} console.log statement(s) — remove before committing\n`
    );
  }
} catch {
  // file not readable — skip
}
