import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

void test("built package exports resolve through the package name", async () => {
  const pluginUrl = import.meta.resolve("@2h2d/oxlint-config/plugin");
  const rulesUrl = import.meta.resolve("@2h2d/oxlint-config/strict-rules");
  const pluginModule: unknown = await import(pluginUrl);
  const rulesModule: unknown = await import(rulesUrl);

  assert.ok(isObject(pluginModule));
  assert.ok("default" in pluginModule);
  assert.ok(isObject(pluginModule.default));
  assert.ok(isObject(rulesModule));
  assert.ok("strictRules" in rulesModule);
  assert.ok(isObject(rulesModule.strictRules));
});

void test("Oxlint loads the built plugin by package specifier", async () => {
  const temporaryDirectory = await mkdtemp(join(root, ".consumer-"));
  try {
    const configPath = join(temporaryDirectory, "oxlint.config.json");
    const sourcePath = join(temporaryDirectory, "input.ts");
    await writeFile(
      configPath,
      `${JSON.stringify(
        {
          jsPlugins: [
            {
              name: "2h2d",
              specifier: "@2h2d/oxlint-config/plugin",
            },
          ],
          rules: {
            "2h2d/no-shape-in-symbol-names": "error",
            "preserve-caught-error": ["error", { requireCatchParameter: true }],
            "typescript/no-explicit-any": "error",
          },
        },
        null,
        2,
      )}\n`,
    );
    await writeFile(
      sourcePath,
      [
        "const responseShape: any = 1;",
        "try {",
        "  operation();",
        "} catch (cause) {",
        '  throw new Error("Operation failed");',
        "}",
        "",
      ].join("\n"),
    );

    const result = spawnSync(
      resolve(root, "node_modules", "oxlint", "bin", "oxlint"),
      ["--config", configPath, "--format", "json", sourcePath],
      {
        cwd: root,
        encoding: "utf8",
      },
    );

    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, /2h2d\(no-shape-in-symbol-names\)/u);
    assert.match(result.stdout, /eslint\(preserve-caught-error\)/u);
    assert.match(result.stdout, /typescript\(no-explicit-any\)/u);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
