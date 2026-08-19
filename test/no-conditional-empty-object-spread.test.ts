import { RuleTester } from "oxlint/plugins-dev";

import { noConditionalEmptyObjectSpreadRule } from "../src/rules/no-conditional-empty-object-spread.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "avoid" };

if (noConditionalEmptyObjectSpreadRule.meta?.fixable !== undefined) {
  throw new Error("The rule must not offer an unsafe semantics-changing fix.");
}

tester.run("2h2d/no-conditional-empty-object-spread", noConditionalEmptyObjectSpreadRule, {
  valid: [
    "const result = { value };",
    "const result = { ...values };",
    "const result = condition ? { value } : {};",
    "const result = [...(condition ? values : [])];",
  ],
  invalid: [
    {
      code: "const result = { ...(value !== undefined ? { value } : {}) };",
      errors: [error],
    },
    {
      code: "const result = { ...(condition ? {} : { value }) };",
      errors: [error],
    },
    {
      code: "const result = { ...(condition ? primary : fallback) };",
      errors: [error],
    },
    {
      code: "const result = { ...((condition ? { value } : {}) satisfies Options) };",
      errors: [error],
    },
    {
      code: "const result = { ...(first ? (second ? { value } : {}) : fallback) };",
      errors: [error],
    },
    {
      code: "const result = { ...(condition && { value }) };",
      errors: [error],
    },
    {
      code: "const result = { ...(options ?? {}) };",
      errors: [error],
    },
    {
      code: "const result = { ...(primary || fallback) };",
      errors: [error],
    },
  ],
});
