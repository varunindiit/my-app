"use strict";

// A ~40-line test harness so the CLI can stay at zero dependencies.
//
// `node:test` would also work, but its output format varies across the Node
// versions in the support matrix (20 / 22 / 24), and this package's whole
// selling point is that `npx` needs to install nothing extra.

const tests = [];

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

/** Register a test. Async functions are supported. */
function test(name, fn) {
  tests.push({ name, fn });
}

/** Run everything registered so far and exit non-zero on any failure. */
async function run(title = "tests") {
  const failures = [];

  console.log(`\n${title}\n`);

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`  ${GREEN}✔${RESET} ${name}`);
    } catch (error) {
      failures.push({ name, error });
      console.log(`  ${RED}✖ ${name}${RESET}`);
      const detail = error && error.message ? error.message : String(error);
      console.log(`    ${DIM}${detail.split("\n").join("\n    ")}${RESET}`);
    }
  }

  const passed = tests.length - failures.length;
  console.log(
    `\n${failures.length ? RED : GREEN}${passed}/${tests.length} passed${RESET}\n`,
  );

  if (failures.length) process.exit(1);
}

module.exports = { test, run };
