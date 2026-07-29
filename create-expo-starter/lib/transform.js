"use strict";

/**
 * Text transforms applied to the scaffolded tree: placeholder substitution and
 * feature-marker stripping.
 *
 * Both are deliberately dumb string operations with no template engine — the
 * template must remain a runnable Expo app that type-checks and lints in place,
 * so anything that isn't valid TypeScript (mustaches, EJS tags) is off limits.
 */

// ── placeholder substitution ────────────────────────────────────────────────

/**
 * Escape a value for safe interpolation into a JSON string literal.
 *
 * `__APP_DISPLAY_NAME__` lands inside app.json. A project called
 * `My "Cool" App` would otherwise produce invalid JSON and a project that
 * won't boot.
 */
function escapeForJson(value) {
  const json = JSON.stringify(String(value));
  return json.slice(1, -1); // drop the wrapping quotes
}

/**
 * Replace `__APP_*__` placeholders in `content`.
 *
 * The replacement is passed as a *function* so `$&`, `` $` `` and `$1` in a
 * user-supplied project name are inserted literally instead of being
 * interpreted as `String.replace` substitution patterns.
 */
function applyTokens(content, tokens, { json = false } = {}) {
  let next = content;
  for (const [key, rawValue] of Object.entries(tokens)) {
    const value = json ? escapeForJson(rawValue) : String(rawValue);
    next = next.split(key).join(value);
  }
  return next;
}

// ── feature markers ─────────────────────────────────────────────────────────

const MARKER = /^[ \t]*(?:\{\s*)?\/[/*]\s*#(if|else|endif)(?:\s+([A-Za-z0-9_-]+))?\s*(?:\*\/\s*\})?[ \t]*$/;

/**
 * Strip regions guarded by `#if <feature>` markers whose feature is disabled.
 *
 * Marker lines are always removed, so an all-features-enabled scaffold is
 * byte-identical to the template minus the comments.
 *
 * Throws on an unbalanced block rather than silently emitting broken source —
 * a mismatched `#endif` would otherwise ship a half-deleted file.
 */
function stripFeatureMarkers(content, features, filePathForErrors = "<unknown>") {
  // Cheap bail-out for the common case, but it must match *every* directive:
  // a stray `#endif` with no `#if` is exactly the corruption worth reporting.
  if (!/#(?:if|else|endif)\b/.test(content)) return content;

  const lines = content.split("\n");
  const out = [];
  /** @type {{feature: string, keep: boolean, inElse: boolean}[]} */
  const stack = [];

  const emitting = () => stack.every((frame) => frame.keep !== frame.inElse);

  for (const [index, line] of lines.entries()) {
    const match = MARKER.exec(line);

    if (!match) {
      if (emitting()) out.push(line);
      continue;
    }

    const [, directive, feature] = match;

    if (directive === "if") {
      if (!feature) {
        throw new Error(`${filePathForErrors}:${index + 1} — '#if' needs a feature name`);
      }
      stack.push({ feature, keep: Boolean(features[feature]), inElse: false });
    } else if (directive === "else") {
      const frame = stack[stack.length - 1];
      if (!frame) {
        throw new Error(`${filePathForErrors}:${index + 1} — '#else' outside of an '#if'`);
      }
      frame.inElse = true;
    } else {
      if (!stack.pop()) {
        throw new Error(`${filePathForErrors}:${index + 1} — '#endif' without a matching '#if'`);
      }
    }
  }

  if (stack.length) {
    throw new Error(
      `${filePathForErrors} — unclosed '#if ${stack[stack.length - 1].feature}'`,
    );
  }

  return out.join("\n");
}

/**
 * Collapse the runs of blank lines that marker removal leaves behind, so the
 * generated file looks hand-written rather than machine-gutted.
 */
function tidyBlankLines(content) {
  return content.replace(/\n{3,}/g, "\n\n");
}

module.exports = {
  escapeForJson,
  applyTokens,
  stripFeatureMarkers,
  tidyBlankLines,
  MARKER,
};
