#!/usr/bin/env node

/**
 * PreToolUse hook: confirm before git push
 * Outputs a reminder to review changes before pushing
 */

const input = JSON.parse(process.argv[2] || "{}");
const toolName = input.tool_name || "";
const command = input.tool_params?.command || "";

if (toolName !== "Bash") process.exit(0);
if (!command.match(/git\s+push/)) process.exit(0);

// Output to additionalContext so user sees it
const message = JSON.stringify({
  additionalContext: "⚠️ About to git push — have you reviewed the diff and run validate?"
});
process.stdout.write(message);
