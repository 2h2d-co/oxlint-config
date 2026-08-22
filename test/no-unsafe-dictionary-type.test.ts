import { RuleTester } from "oxlint/plugins-dev";

import { noUnsafeDictionaryTypeRule } from "../src/rules/no-unsafe-dictionary-type.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "unsafeDictionary" };

tester.run("2h2d/no-unsafe-dictionary-type", noUnsafeDictionaryTypeRule, {
  valid: [
    "type Commands = Record<string, Command>;",
    "type Metadata = Record<PropertyKey, JsonValue>;",
    "type UnknownValues = Record<string, unknown>;",
    "type UnknownIndex = { [key: string]: unknown };",
    "interface UnknownInterface { [key: string]: unknown }",
    "type UnknownDominates = Record<string, object | unknown>;",
    "type WrappedUnknown = Readonly<Partial<Record<string, unknown>>>;",
    "type Generic<T> = Record<string, T>; type UnknownGeneric = Generic<unknown>;",
    "type PermissionLevels = Record<Permission, number>;",
    "type Exhaustive = { [K in Permission]: number };",
    "type Allowed = Record<string, { payload: unknown }>;",
    "type AlsoAllowed = Record<string, Result<Data, unknown>>;",
    "type Index<T> = Record<string, T>; type EntityIndex<T extends Entity> = Record<string, T>;",
    "type A = Map<string, unknown>; type B = ReadonlyMap<string, unknown>; type C = WeakMap<object, unknown>;",
    "import { Record } from './local'; type A = Record<string, object>;",
    "type Record<K, V> = { key: K; value: V }; type A = Record<string, object>;",
    "interface Owner { readonly id: string } type A = Record<string, object & Owner>;",
    "type Escape = object; type Dictionary<Escape> = Record<string, Escape>;",
    "type Key = object; type Mapped<Input> = { [Key in keyof Input]: Record<string, Key> };",
    "type Item = object; type Unpacked<Input> = Input extends Promise<infer Item> ? Record<string, Item> : never;",
    "type NativeAnyOwnsThisDiagnostic = Record<string, any>;",
  ],
  invalid: [
    { code: "type A = Record<string, object>;", errors: [error] },
    { code: "type A = { [key: string]: object };", errors: [error] },
    { code: "interface A { [key: string]: object }", errors: [error] },
    { code: "type A = { [K in PropertyKey]: object };", errors: [error] },
    { code: "type A = Record<string, {}>;", errors: [error] },
    { code: "type A = Record<string, unknown & object>;", errors: [error] },
    { code: "type A = Record<string, unknown & {}>;", errors: [error] },
    { code: "type A = Record<string, NonNullable<unknown>>;", errors: [error] },
    { code: "type A = Record<string, object & {}>;", errors: [error] },
    { code: "type A = Record<string, string | object>;", errors: [error] },
    { code: "interface Escape {} type A = Record<string, Escape>;", errors: [error] },
    {
      code: "interface Escape { readonly __brand?: never } type A = Record<string, Escape>;",
      errors: [error],
    },
    {
      code: "type Escape = { readonly __brand?: never }; type A = Record<string, Escape>;",
      errors: [error],
    },
    {
      code: "function scoped() { type Escape = object; type A = Record<string, Escape>; }",
      errors: [error],
    },
    {
      code: "function scoped() { type A = Record<string, Escape>; type Escape = object; }",
      errors: [error],
    },
    {
      code: "type Escape = object; type Fallback<Input> = Input extends infer Escape ? string : Record<string, Escape>;",
      errors: [error],
    },
    {
      code: "type Unsafe = Record<string, object>; const x: Unsafe = {}; const y: Unsafe = {};",
      errors: 1,
    },
    {
      code: "type Unsafe = Record<string, object>; type AlsoUnsafe = Unsafe; const x: Unsafe = {};",
      errors: 2,
    },
    { code: "type Index<T = object> = Record<string, T>; type A = Index;", errors: 1 },
    {
      code: "type Index<T, U = T> = Record<string, U>; type A = Index<string, object>;",
      errors: 1,
    },
    {
      code: "type Index<T, U = T> = Record<string, U>; type A = Index<object>;",
      errors: 1,
    },
    { code: "type A = Readonly<Partial<Record<string, object>>>;", errors: 1 },
  ],
});
