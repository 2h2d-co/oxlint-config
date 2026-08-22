import { RuleTester } from "oxlint/plugins-dev";

import { noBroadObjectParametersRule } from "../src/rules/no-broad-object-parameters.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "broadObjectParameter" };

tester.run("2h2d/no-broad-object-parameters", noBroadObjectParametersRule, {
  valid: [
    "type Alias = object;",
    "function f(value: Alias) {}",
    "interface Owner { readonly id: string } function f(value: Owner) {}",
    "function f<Value>(value: Value) {}",
    "function f<Value extends object>(value: Value) {}",
    "function f<Value extends Owner, Owner extends { readonly id: string }>(value: Value) {}",
    "type Owner = { readonly id: string }; function f<Value extends Owner>(value: Value) {}",
    "function f(value: object | unknown) {}",
    "type UnknownValue = unknown; function f(value: object | UnknownValue) {}",
    "interface Owner { readonly id: string } function f(value: object & Owner) {}",
    "type Alias = object; function consume<Alias>(value: Alias) {}",
    "type Alias = object; function outer() { type Alias = { id: string }; function consume(value: Alias) {} }",
    "type Alias = object; type Consumer<Alias> = (value: Alias) => void;",
    "type Alias = object; interface Consumer<Alias> { consume(value: Alias): void }",
    "type Key = object; type Mapped<Input> = { [Key in keyof Input]: (value: Key) => void };",
    "type Item = object; type Unpacked<Input> = Input extends Promise<infer Item> ? (value: Item) => void : never;",
    "interface Owner { readonly id: string } type Alias<T> = T; function f(value: Alias<Owner>) {}",
    "type Alias<T = unknown> = object | T; function f(value: Alias) {}",
    "type Alias<T = object> = T; function f<Alias>(value: Alias) {}",
  ],
  invalid: [
    { code: "function f(value: object) {}", errors: [error] },
    { code: "type Alias = object; function f(value: Alias) {}", errors: [error] },
    { code: "type Alias = (object); function f(value: Alias) {}", errors: [error] },
    { code: "function f(value: unknown & object) {}", errors: [error] },
    {
      code: "function outer() { type Alias = object; function f(value: Alias) {} }",
      errors: [error],
    },
    {
      code: "function outer() { function f(value: Alias) {} type Alias = object; }",
      errors: [error],
    },
    {
      code: "type Item = object; type Fallback<Input> = Input extends infer Item ? string : (value: Item) => void;",
      errors: [error],
    },
    {
      code: "type Alias<T = object> = T; function f(value: Alias) {}",
      errors: [error],
    },
    {
      code: "type Alias<T> = T; function f(value: Alias<object>) {}",
      errors: [error],
    },
    {
      code: "type Inner<T> = T; type Outer<T = object> = Inner<T>; function f(value: Outer) {}",
      errors: [error],
    },
    {
      code: "type Alias<T> = object | T; function f(value: Alias<string>) {}",
      errors: [error],
    },
  ],
});
