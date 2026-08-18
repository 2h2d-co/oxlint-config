import { RuleTester } from "oxlint/plugins-dev";

import { noKnownValueWideningRule } from "../src/rules/no-known-value-widening.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

const error = { messageId: "widening" };
const prelude = "type Command = () => void; const startCommand = () => {};";

tester.run("2h2d/no-known-value-widening", noKnownValueWideningRule, {
  valid: [
    `${prelude} const commands: Record<string, Command> = {};`,
    `${prelude} class Registry { commands: Record<string, Command> = {}; }`,
    `${prelude} let commands: Record<string, Command>; commands = {};`,
    `${prelude} function create(): Record<string, Command> { return { start: startCommand }; }`,
    `${prelude} const create = (): Record<string, Command> => ({ start: startCommand });`,
    `${prelude} const commands = { start: startCommand };`,
    `${prelude} const commands = { start: startCommand } satisfies Record<string, Command>;`,
    `${prelude} type Commands = { readonly start: Command }; const commands: Commands = { start: startCommand };`,
    `${prelude} const commands: { start: Command } = { start: startCommand };`,
    `${prelude} declare function make(): Record<string, Command>; const commands: Record<string, Command> = make();`,
    "const value: unknown = {};",
    "const value: object = {};",
    "const value: unknown = 1;",
  ],
  invalid: [
    {
      code: `${prelude} const commands: Record<string, Command> = { start: startCommand };`,
      errors: [error],
    },
    {
      code: `${prelude} const commands: { [key: string]: Command } = { start: startCommand };`,
      errors: [error],
    },
    {
      code: `${prelude} const commands: { [K in string]: Command } = { start: startCommand };`,
      errors: [error],
    },
    {
      code: `${prelude} class Registry { commands: Record<string, Command> = { start: startCommand }; }`,
      errors: [error],
    },
    {
      code: `${prelude} let commands: Record<string, Command>; commands = { start: startCommand };`,
      errors: [error],
    },
    {
      code: `${prelude} const source = { start: startCommand }; const commands: Record<string, Command> = source;`,
      errors: [error],
    },
    {
      code: `${prelude} type Index<T> = Record<string, T>; const commands: Index<Command> = { start: startCommand };`,
      errors: [error],
    },
  ],
});
