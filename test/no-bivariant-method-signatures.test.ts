import { RuleTester } from "oxlint/plugins-dev";

import { noBivariantMethodSignaturesRule } from "../src/rules/no-bivariant-method-signatures.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "bivariantMethod" };

tester.run("2h2d/no-bivariant-method-signatures", noBivariantMethodSignaturesRule, {
  valid: [
    "type Api = { handle: (value: string) => void };",
    "interface Api { handle: (value: string) => void }",
    "type Callback = (value: string) => void;",
    "type Callable = { (value: string): void };",
    "type Constructable = { new (value: string): object };",
    "class Service { handle(value: string): void {} }",
    "const service = { handle(value: string): void {} };",
  ],
  invalid: [
    { code: "type Api = { handle(value: string): void };", errors: [error] },
    { code: "interface Api { handle(value: string): void }", errors: [error] },
    { code: "type Api = { handle?(value: string): void };", errors: [error] },
    { code: "type Api = { handle<Value>(value: Value): Value };", errors: [error] },
    { code: 'type Api = { "handle"(value: string): void };', errors: [error] },
    { code: "type Api = { [Symbol.dispose](): void };", errors: [error] },
  ],
});
