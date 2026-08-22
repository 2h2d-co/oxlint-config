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

test("built package exports resolve through the package name", async () => {
  const advisoryRulesUrl = import.meta.resolve("@2h2d/oxlint-config/advisory-rules");
  const pluginUrl = import.meta.resolve("@2h2d/oxlint-config/plugin");
  const rulesUrl = import.meta.resolve("@2h2d/oxlint-config/strict-rules");
  const advisoryRulesModule: unknown = await import(advisoryRulesUrl);
  const pluginModule: unknown = await import(pluginUrl);
  const rulesModule: unknown = await import(rulesUrl);

  assert.ok(isObject(advisoryRulesModule));
  assert.ok("advisoryRules" in advisoryRulesModule);
  assert.ok(isObject(advisoryRulesModule.advisoryRules));
  assert.ok(isObject(pluginModule));
  assert.ok("default" in pluginModule);
  assert.ok(isObject(pluginModule.default));
  assert.ok(isObject(rulesModule));
  assert.ok("strictRules" in rulesModule);
  assert.ok(isObject(rulesModule.strictRules));
});

test("Oxlint loads the built plugin by package specifier", async () => {
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
            "2h2d/no-object-parameters": "error",
            "2h2d/no-typebox-unsafe": "error",
            "preserve-caught-error": ["error", { requireCatchParameter: true }],
            "typescript/ban-ts-comment": [
              "error",
              {
                "ts-check": false,
                "ts-expect-error": "allow-with-description",
                "ts-ignore": true,
                "ts-nocheck": true,
                minimumDescriptionLength: 10,
              },
            ],
            "typescript/method-signature-style": ["error", "property"],
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
        "const response: any = 1;",
        "// @ts-ignore: this integration fixture must exercise the native directive policy.",
        "const ignored: string = 1;",
        "// @ts-expect-error: this explained negative type fixture is intentionally invalid.",
        "const expected: string = 1;",
        "function accept(value: object) { return value; }",
        "interface Handler { handle(value: string): void }",
        "import { Type } from 'typebox'; Type.Unsafe<string>({ type: 'string' });",
        "try { cleanup(); } catch {}",
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
    assert.match(result.stdout, /2h2d\(no-object-parameters\)/u);
    assert.match(result.stdout, /2h2d\(no-typebox-unsafe\)/u);
    assert.match(result.stdout, /eslint\(preserve-caught-error\)/u);
    assert.match(result.stdout, /typescript\(ban-ts-comment\)/u);
    assert.match(result.stdout, /typescript\(method-signature-style\)/u);
    assert.match(result.stdout, /typescript\(no-explicit-any\)/u);
    const report: unknown = JSON.parse(result.stdout);
    assert.ok(isObject(report));
    assert.ok("diagnostics" in report);
    assert.ok(Array.isArray(report.diagnostics));
    const typeScriptDirectiveFindings = report.diagnostics.filter(
      (diagnostic) =>
        isObject(diagnostic) &&
        "code" in diagnostic &&
        diagnostic.code === "typescript(ban-ts-comment)",
    );
    assert.equal(typeScriptDirectiveFindings.length, 1);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("Promise exemptions are limited to node:test declarations", async () => {
  const temporaryDirectory = await mkdtemp(join(root, ".consumer-"));
  try {
    const configPath = join(temporaryDirectory, "oxlint.config.json");
    const sourcePath = join(temporaryDirectory, "input.ts");
    const tsconfigPath = join(temporaryDirectory, "tsconfig.json");
    await writeFile(
      configPath,
      `${JSON.stringify(
        {
          plugins: ["typescript"],
          rules: {
            "typescript/no-floating-promises": [
              "error",
              {
                allowForKnownSafeCalls: [
                  {
                    from: "package",
                    name: ["describe", "it", "test"],
                    package: "node:test",
                  },
                ],
                ignoreVoid: false,
              },
            ],
          },
          options: {
            typeAware: true,
          },
        },
        null,
        2,
      )}\n`,
    );
    await writeFile(
      tsconfigPath,
      `${JSON.stringify(
        {
          compilerOptions: {
            module: "nodenext",
            strict: true,
            target: "esnext",
            types: ["node"],
          },
          include: ["input.ts"],
        },
        null,
        2,
      )}\n`,
    );
    await writeFile(
      sourcePath,
      [
        'import { test as nodeTest } from "node:test";',
        'nodeTest("observed by the test runner", async () => {});',
        "async function test(): Promise<void> {}",
        "test();",
        "",
      ].join("\n"),
    );

    const result = spawnSync(
      resolve(root, "node_modules", "oxlint", "bin", "oxlint"),
      ["--config", configPath, "--format", "json", "--tsconfig", tsconfigPath, sourcePath],
      {
        cwd: root,
        encoding: "utf8",
      },
    );

    assert.equal(result.status, 1, result.stderr);
    const report: unknown = JSON.parse(result.stdout);
    assert.ok(isObject(report));
    assert.ok("diagnostics" in report);
    assert.ok(Array.isArray(report.diagnostics));
    const floating = report.diagnostics.filter(
      (diagnostic) =>
        isObject(diagnostic) &&
        "code" in diagnostic &&
        diagnostic.code === "typescript(no-floating-promises)",
    );
    assert.equal(floating.length, 1, JSON.stringify(report, null, 2));
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
