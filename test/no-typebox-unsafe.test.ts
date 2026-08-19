import { RuleTester } from "oxlint/plugins-dev";

import { noTypeboxUnsafeRule } from "../src/rules/no-typebox-unsafe.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "typeboxUnsafe" };

tester.run("2h2d/no-typebox-unsafe", noTypeboxUnsafeRule, {
  valid: [
    "import { Type } from 'typebox'; Type.Object({ value: Type.String() });",
    "import type { Static } from 'typebox'; const schema = { type: 'string' } as const; type Value = Static<typeof schema>;",
    "const Type = { Unsafe(value: unknown) { return value; } }; Type.Unsafe('value');",
    "import { Unsafe } from './schema.ts'; Unsafe({ type: 'string' });",
    "import { Type } from 'typebox'; function local(Type: { Unsafe: (value: unknown) => unknown }) { Type.Unsafe('value'); }",
  ],
  invalid: [
    {
      code: "import { Type } from 'typebox'; Type.Unsafe<string>({ type: 'string' });",
      errors: [error],
    },
    {
      code: "import { Type as Schema } from 'typebox'; Schema['Unsafe']<string>({ type: 'string' });",
      errors: [error],
    },
    {
      code: "import Type from 'typebox'; Type.Unsafe<string>({ type: 'string' });",
      errors: [error],
    },
    {
      code: "import { Unsafe } from 'typebox'; Unsafe<string>({ type: 'string' });",
      errors: [error],
    },
    {
      code: "import { Unsafe as unchecked } from 'typebox'; unchecked<string>({ type: 'string' });",
      errors: [error],
    },
    {
      code: "import * as TypeBox from 'typebox'; TypeBox.Unsafe<string>({ type: 'string' });",
      errors: [error],
    },
    {
      code: "import * as TypeBox from 'typebox'; TypeBox.Type.Unsafe<string>({ type: 'string' });",
      errors: [error],
    },
  ],
});
