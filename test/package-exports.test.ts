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
  const pluginUrl = import.meta.resolve("@2h2d/oxlint-config/plugin");
  const rootUrl = import.meta.resolve("@2h2d/oxlint-config");
  const rulesUrl = import.meta.resolve("@2h2d/oxlint-config/strict-rules");
  const pluginModule: unknown = await import(pluginUrl);
  const rootModule: unknown = await import(rootUrl);
  const rulesModule: unknown = await import(rulesUrl);

  assert.ok(isObject(pluginModule));
  assert.ok("default" in pluginModule);
  assert.ok(isObject(pluginModule.default));
  assert.ok(isObject(rootModule));
  assert.ok("plugin" in rootModule);
  assert.ok(isObject(rootModule.plugin));
  assert.ok("strictRules" in rootModule);
  assert.ok(isObject(rootModule.strictRules));
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
            "2h2d/no-broad-object-parameters": "error",
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
    assert.match(result.stdout, /2h2d\(no-broad-object-parameters\)/u);
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

test("native and custom rules divide empty and object dictionary ownership", async () => {
  const temporaryDirectory = await mkdtemp(join(root, ".consumer-"));
  try {
    const configPath = join(temporaryDirectory, "oxlint.config.json");
    const sourcePath = join(temporaryDirectory, "input.ts");
    await writeFile(
      configPath,
      `${JSON.stringify(
        {
          plugins: ["typescript"],
          jsPlugins: [
            {
              name: "2h2d",
              specifier: "@2h2d/oxlint-config/plugin",
            },
          ],
          rules: {
            "2h2d/no-broad-dictionary-values": "error",
            "typescript/no-empty-object-type": "error",
          },
        },
        null,
        2,
      )}\n`,
    );
    await writeFile(
      sourcePath,
      [
        "export type NativeOwned = Record<string, {}>;",
        "export type DerivedEmpty = Record<string, unknown & {}>;",
        "export type ObjectOwned = Record<string, object>;",
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
    const report: unknown = JSON.parse(result.stdout);
    assert.ok(isObject(report));
    assert.ok("diagnostics" in report);
    assert.ok(Array.isArray(report.diagnostics));
    const codes = report.diagnostics.flatMap((diagnostic) =>
      isObject(diagnostic) && "code" in diagnostic && typeof diagnostic.code === "string"
        ? [diagnostic.code]
        : [],
    );
    assert.equal(
      codes.filter((code) => code === "typescript(no-empty-object-type)").length,
      1,
      JSON.stringify(report, null, 2),
    );
    assert.equal(
      codes.filter((code) => code === "2h2d(no-broad-dictionary-values)").length,
      2,
      JSON.stringify(report, null, 2),
    );
    assert.equal(codes.length, 3, JSON.stringify(report, null, 2));
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("broad object policy distinguishes useful generics and reviewed contracts", async () => {
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
          jsPlugins: [
            {
              name: "2h2d",
              specifier: "@2h2d/oxlint-config/plugin",
            },
          ],
          rules: {
            "2h2d/no-broad-object-parameters": "error",
            "2h2d/require-narrow-suppression-directives": "error",
            "typescript/no-unnecessary-type-parameters": "error",
          },
          options: {
            reportUnusedDisableDirectives: "error",
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
          },
          include: ["*.ts"],
        },
        null,
        2,
      )}\n`,
    );
    await writeFile(
      sourcePath,
      [
        "interface User { readonly id: string }",
        "export function specific(value: User): void { console.log(value.id); }",
        "export function clone<Value extends object>(value: Value): Value { return value; }",
        "export function disguised<Value extends object>(value: Value): void { Object.keys(value); }",
        "export function broad(value: object): void { Object.keys(value); }",
        "// oxlint-disable-next-line 2h2d/no-broad-object-parameters -- Every non-primitive value is accepted by this identity registry.",
        "export function reviewed(value: object): void { Object.keys(value); }",
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
    const codes = report.diagnostics.flatMap((diagnostic) =>
      isObject(diagnostic) && "code" in diagnostic && typeof diagnostic.code === "string"
        ? [diagnostic.code]
        : [],
    );
    assert.deepEqual(codes.sort(), [
      "2h2d(no-broad-object-parameters)",
      "typescript(no-unnecessary-type-parameters)",
    ]);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("native additions enforce hazards without rejecting intentional boundaries", async () => {
  const temporaryDirectory = await mkdtemp(join(root, ".consumer-"));
  try {
    const configPath = join(temporaryDirectory, "oxlint.config.json");
    const sourcePath = join(temporaryDirectory, "input.ts");
    const tsconfigPath = join(temporaryDirectory, "tsconfig.json");
    const typesPath = join(temporaryDirectory, "types.ts");
    await writeFile(
      configPath,
      `${JSON.stringify(
        {
          plugins: ["typescript"],
          rules: {
            "array-callback-return": "error",
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-new-func": "error",
            "typescript/no-empty-object-type": "error",
            "typescript/no-import-type-side-effects": "error",
            "typescript/no-invalid-void-type": "error",
            "typescript/no-unnecessary-type-parameters": "error",
            "typescript/no-unsafe-enum-comparison": "error",
            "typescript/no-unsafe-function-type": "error",
            "typescript/prefer-promise-reject-errors": [
              "error",
              {
                allowEmptyReject: false,
                allowThrowingAny: true,
                allowThrowingUnknown: true,
              },
            ],
            "typescript/return-await": ["error", "error-handling-correctness-only"],
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
          },
          include: ["*.ts"],
        },
        null,
        2,
      )}\n`,
    );
    await writeFile(typesPath, "export type Value = string;\n");
    await writeFile(
      sourcePath,
      [
        "import { type Value } from './types.js';",
        "declare const maybe: Value | null | undefined;",
        "if (maybe == null) {}",
        "declare const unknownReason: unknown;",
        "declare const externalReason: any;",
        "Promise.reject(unknownReason);",
        "Promise.reject(externalReason);",
        "if (1 == '1') {}",
        "[1].map(() => {});",
        "new Function('return 1');",
        "export type Empty = {};",
        "export type InvalidVoid = void;",
        "export let unsafeFunction: Function;",
        "export function identity<Value>(value: Value): Value { return value; }",
        "export function consumeOnly<Value extends object>(value: Value): void { Object.keys(value); }",
        "enum Left { Value = 'value' }",
        "enum Right { Value = 'value' }",
        "if (Left.Value === Right.Value) {}",
        "Promise.reject('failure');",
        "export async function catchesRejection(): Promise<void> {",
        "  try {",
        "    return Promise.reject(new Error('failure'));",
        "  } catch (error) {",
        "    throw error;",
        "  }",
        "}",
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
    const codes = report.diagnostics.flatMap((diagnostic) =>
      isObject(diagnostic) && "code" in diagnostic && typeof diagnostic.code === "string"
        ? [diagnostic.code]
        : [],
    );
    const expectedCodes = [
      "eslint(array-callback-return)",
      "eslint(eqeqeq)",
      "eslint(no-new-func)",
      "typescript(no-empty-object-type)",
      "typescript(no-import-type-side-effects)",
      "typescript(no-invalid-void-type)",
      "typescript(no-unnecessary-type-parameters)",
      "typescript(no-unsafe-enum-comparison)",
      "typescript(no-unsafe-function-type)",
      "typescript(prefer-promise-reject-errors)",
      "typescript(return-await)",
    ];
    for (const code of expectedCodes) {
      assert.equal(
        codes.filter((candidate) => candidate === code).length,
        1,
        `${code}\n${JSON.stringify(report, null, 2)}`,
      );
    }
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
