"use strict";

const readline = require("readline");
const { c } = require("./utils");

/**
 * Minimal zero-dependency prompt helpers built on Node's readline.
 * Each returns a Promise; the shared interface is created lazily and closed
 * by the caller via `close()`.
 */
function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let closed = false;

  const question = (q) =>
    new Promise((resolve, reject) => {
      if (closed) return reject(new Error("Prompter is closed"));
      rl.question(q, resolve);
    });

  // Ctrl-D (or a closed pipe) resolves `question` with nothing and would
  // otherwise spin the validation loop forever.
  rl.on("close", () => {
    closed = true;
  });

  const assertOpen = () => {
    if (closed) {
      throw new Error("Input stream closed before all questions were answered.");
    }
  };

  /**
   * Ask for free text.
   * @param {string} message
   * @param {object} [opts] { defaultValue, validate(value) => true | string }
   */
  async function ask(message, opts = {}) {
    const { defaultValue, validate } = opts;
    const hint = defaultValue ? c.dim(` (${defaultValue})`) : "";

    for (;;) {
      const raw = (await question(`${c.cyan("?")} ${message}${hint}: `)).trim();
      assertOpen();

      const value = raw || defaultValue || "";
      if (!value) {
        console.log(c.red("  Please enter a value."));
        continue;
      }

      if (validate) {
        const result = validate(value);
        if (result !== true) {
          console.log(c.red(`  ${result}`));
          continue;
        }
      }

      return value;
    }
  }

  /** Yes/no confirmation. */
  async function confirm(message, defaultYes = true) {
    const hint = defaultYes ? c.dim(" (Y/n)") : c.dim(" (y/N)");
    const raw = (await question(`${c.cyan("?")} ${message}${hint}: `))
      .trim()
      .toLowerCase();
    if (!raw) return defaultYes;
    return raw === "y" || raw === "yes";
  }

  /**
   * Numbered single choice.
   * @param {string} message
   * @param {{value: string, label: string, hint?: string}[]} choices
   * @param {string} defaultValue
   */
  async function select(message, choices, defaultValue) {
    const defaultIndex = Math.max(
      0,
      choices.findIndex((choice) => choice.value === defaultValue),
    );

    console.log(`${c.cyan("?")} ${message}`);
    choices.forEach((choice, index) => {
      const marker = index === defaultIndex ? c.cyan("›") : " ";
      const hint = choice.hint ? c.dim(`  ${choice.hint}`) : "";
      console.log(`  ${marker} ${c.bold(String(index + 1))}. ${choice.label}${hint}`);
    });

    for (;;) {
      const raw = (
        await question(
          `  ${c.dim(`Choose 1-${choices.length}`)} ${c.dim(
            `(${defaultIndex + 1})`,
          )}: `,
        )
      ).trim();
      assertOpen();

      if (!raw) return choices[defaultIndex].value;

      const index = Number.parseInt(raw, 10) - 1;
      if (Number.isInteger(index) && index >= 0 && index < choices.length) {
        return choices[index].value;
      }

      console.log(c.red(`  Enter a number between 1 and ${choices.length}.`));
    }
  }

  function close() {
    closed = true;
    rl.close();
  }

  return { ask, confirm, select, close };
}

module.exports = { createPrompter };
