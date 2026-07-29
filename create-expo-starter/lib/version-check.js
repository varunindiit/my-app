"use strict";

const https = require("https");

/**
 * Non-blocking "a newer version exists" check.
 *
 * `npx` resolves the latest version by default, but plenty of people run a
 * globally installed copy or a pinned one, and scaffolding from a stale CLI
 * silently produces an outdated project. Everything here is best-effort: the
 * request is capped at two seconds, every failure path resolves to `null`, and
 * nothing is written to disk. An offline user never notices.
 */

const REGISTRY = "https://registry.npmjs.org";
const TIMEOUT_MS = 2000;

/** Compare two semver strings. Returns true when `candidate` is newer. */
function isNewer(candidate, current) {
  const parse = (v) =>
    String(v)
      .replace(/^v/, "")
      .split("-")[0]
      .split(".")
      .map((n) => Number.parseInt(n, 10) || 0);

  const [aMajor, aMinor, aPatch] = parse(candidate);
  const [bMajor, bMinor, bPatch] = parse(current);

  if (aMajor !== bMajor) return aMajor > bMajor;
  if (aMinor !== bMinor) return aMinor > bMinor;
  return aPatch > bPatch;
}

/** Resolve to the latest published version, or null if it can't be determined. */
function fetchLatestVersion(packageName) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    const request = https.get(
      `${REGISTRY}/${encodeURIComponent(packageName)}/latest`,
      { headers: { Accept: "application/vnd.npm.install-v1+json" } },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          return finish(null);
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
          // Guard against an unbounded response.
          if (body.length > 1_000_000) {
            request.destroy();
            finish(null);
          }
        });
        response.on("end", () => {
          try {
            finish(JSON.parse(body).version ?? null);
          } catch {
            finish(null);
          }
        });
      },
    );

    request.setTimeout(TIMEOUT_MS, () => {
      request.destroy();
      finish(null);
    });
    request.on("error", () => finish(null));
  });
}

/**
 * Returns the newer version string, or null.
 * Skipped entirely in CI and when the user opts out.
 */
async function checkForUpdate(packageName, currentVersion) {
  if (process.env.CES_DISABLE_UPDATE_CHECK || process.env.CI) return null;

  try {
    const latest = await fetchLatestVersion(packageName);
    return latest && isNewer(latest, currentVersion) ? latest : null;
  } catch {
    return null;
  }
}

module.exports = { checkForUpdate, fetchLatestVersion, isNewer };
